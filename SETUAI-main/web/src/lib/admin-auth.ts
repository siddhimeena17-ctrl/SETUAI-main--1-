import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual, type ScryptOptions } from "crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import {
  ADMIN_CHALLENGE_COOKIE,
  ADMIN_CHALLENGE_TTL_SECONDS,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  getAdminSessionSecretStatus,
  signAdminChallenge,
  signAdminSession,
  verifyAdminChallengeToken,
  verifyAdminSessionToken,
} from "@/lib/admin-session";
import {
  appendAdminAuditEvent,
  checkAdminRateLimit,
  createAdminChallenge,
  createAdminSession,
  deleteAdminChallenge,
  deleteAdminSession,
  getAdminChallenge,
  getAdminSession,
  getAdminUserByEmail,
  getAdminUserById,
  hasAdminUsers,
  hashAdminIdentifier,
  isAdminStoreConfigured,
  saveAdminChallenge,
  saveAdminUser,
  type AdminChallengeRecord,
  type AdminUser,
} from "@/lib/admin-store";
import { generateTotpSecret, verifyTotpCode } from "@/lib/totp";

export type AdminAuthFormState = {
  error?: string;
};

export type AdminSessionView = {
  user: Pick<AdminUser, "id" | "email" | "name" | "role">;
  sessionId: string;
  expiresAt: string;
};

type RequestContext = {
  ip: string;
  userAgent: string;
  ipHash: string;
  userAgentHash: string;
};

const PASSWORD_LOCK_MINUTES = 15;

function now() {
  return new Date().toISOString();
}

function expiresIn(seconds: number) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function secureCookie() {
  return process.env.NODE_ENV === "production";
}

function normalizeEmail(value: FormDataEntryValue | null) {
  return String(value || "").trim().toLowerCase();
}

function normalizeText(value: FormDataEntryValue | null) {
  return String(value || "").trim();
}

function allowedAdminEmails() {
  return (process.env.ADMIN_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function isAdminEmailAllowed(email: string) {
  const allowed = allowedAdminEmails();
  return !allowed.length || allowed.includes(email);
}

function getClientIp(headerList: Headers) {
  return (
    headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headerList.get("x-real-ip") ||
    "unknown"
  );
}

function contextFromHeaders(headerList: Headers): RequestContext {
  const ip = getClientIp(headerList);
  const userAgent = headerList.get("user-agent") || "unknown";

  return {
    ip,
    userAgent,
    ipHash: hashAdminIdentifier(ip),
    userAgentHash: hashAdminIdentifier(userAgent),
  };
}

async function getServerActionContext() {
  return contextFromHeaders(await headers());
}

function safeStringEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    timingSafeEqual(Buffer.from(hashAdminIdentifier(a)), Buffer.from(hashAdminIdentifier(b)));
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function readCookie(cookieHeader: string | null, name: string) {
  return (cookieHeader || "")
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

function sanitizeNextPath(value: FormDataEntryValue | string | null) {
  const nextPath = String(value || "/admin");
  if (!nextPath.startsWith("/admin")) return "/admin";
  if (nextPath.startsWith("//")) return "/admin";
  return nextPath;
}

function passwordProblems(password: string) {
  const problems = [];
  if (password.length < 14) problems.push("Use at least 14 characters.");
  if (!/[a-z]/.test(password)) problems.push("Add a lowercase letter.");
  if (!/[A-Z]/.test(password)) problems.push("Add an uppercase letter.");
  if (!/\d/.test(password)) problems.push("Add a number.");
  if (!/[^A-Za-z0-9]/.test(password)) problems.push("Add a symbol.");
  return problems;
}

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const derived = await scrypt(password, salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
    maxmem: 64 * 1024 * 1024,
  });

  return `scrypt:16384:8:1:${salt}:${derived.toString("base64url")}`;
}

async function verifyPassword(password: string, storedHash: string) {
  const [scheme, n, r, p, salt, hash] = storedHash.split(":");
  if (scheme !== "scrypt" || !n || !r || !p || !salt || !hash) return false;

  const derived = await scrypt(password, salt, 64, {
    N: Number(n),
    r: Number(r),
    p: Number(p),
    maxmem: 64 * 1024 * 1024,
  });

  const stored = Buffer.from(hash, "base64url");
  if (stored.length !== derived.length) return false;
  return timingSafeEqual(stored, derived);
}

function scrypt(password: string, salt: string, keylen: number, options: ScryptOptions) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, keylen, options, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

function authIsConfiguredForRuntime() {
  const sessionSecret = getAdminSessionSecretStatus();
  return isAdminStoreConfigured() && sessionSecret.strong;
}

export function getAdminAuthStatus() {
  const sessionSecret = getAdminSessionSecretStatus();
  return {
    redisConfigured: isAdminStoreConfigured(),
    sessionSecretConfigured: sessionSecret.configured,
    sessionSecretStrong: sessionSecret.strong,
    bootstrapTokenConfigured: Boolean(process.env.ADMIN_BOOTSTRAP_TOKEN),
    allowedEmailLockConfigured: allowedAdminEmails().length > 0,
  };
}

async function createChallengeCookie({
  user,
  purpose,
  nextPath,
  context,
}: {
  user: AdminUser;
  purpose: "login" | "enroll";
  nextPath: string;
  context: RequestContext;
}) {
  const challenge = await createAdminChallenge({
    userId: user.id,
    purpose,
    nextPath,
    expiresAt: expiresIn(ADMIN_CHALLENGE_TTL_SECONDS),
    ipHash: context.ipHash,
    userAgentHash: context.userAgentHash,
  });
  const token = signAdminChallenge({
    cid: challenge.id,
    uid: user.id,
    purpose,
    exp: new Date(challenge.expiresAt).getTime(),
  });

  (await cookies()).set(ADMIN_CHALLENGE_COOKIE, token, {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "strict",
    maxAge: ADMIN_CHALLENGE_TTL_SECONDS,
    path: "/admin",
    priority: "high",
  });
}

async function clearChallenge(challengeId?: string) {
  if (challengeId) await deleteAdminChallenge(challengeId);
  (await cookies()).set(ADMIN_CHALLENGE_COOKIE, "", {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "strict",
    maxAge: 0,
    path: "/admin",
  });
}

async function createSessionCookie(user: AdminUser, context: RequestContext) {
  const session = await createAdminSession({
    userId: user.id,
    expiresAt: expiresIn(ADMIN_SESSION_TTL_SECONDS),
    ipHash: context.ipHash,
    userAgentHash: context.userAgentHash,
  });
  const token = signAdminSession({
    sid: session.id,
    uid: user.id,
    role: user.role,
    exp: new Date(session.expiresAt).getTime(),
  });

  (await cookies()).set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "strict",
    maxAge: ADMIN_SESSION_TTL_SECONDS,
    path: "/",
    priority: "high",
  });

  return session;
}

export async function getAdminSessionFromToken(token: string | undefined, context?: RequestContext) {
  if (!authIsConfiguredForRuntime()) return null;

  const payload = verifyAdminSessionToken(token);
  if (!payload) return null;

  const session = await getAdminSession(payload.sid);
  if (!session || session.userId !== payload.uid || new Date(session.expiresAt).getTime() <= Date.now()) {
    return null;
  }

  if (
    context &&
    (session.ipHash !== context.ipHash || session.userAgentHash !== context.userAgentHash)
  ) {
    await deleteAdminSession(session.id);
    await appendAdminAuditEvent({
      type: "admin-api-blocked",
      userId: payload.uid,
      detail: "Blocked admin session context mismatch.",
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
    });
    return null;
  }

  const user = await getAdminUserById(payload.uid);
  if (!user || !user.totpEnabled) return null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    sessionId: session.id,
    expiresAt: session.expiresAt,
  } satisfies AdminSessionView;
}

export async function getOptionalAdminSession() {
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const context = await getServerActionContext();
  return getAdminSessionFromToken(token, context);
}

export async function requireAdminPage(nextPath = "/admin") {
  const session = await getOptionalAdminSession();
  if (!session) redirect(`/admin/login?next=${encodeURIComponent(nextPath)}`);
  return session;
}

export async function requireAdminApi(
  request: Request,
  options: { allowedContentTypes?: string[] } = {},
) {
  const context = contextFromHeaders(request.headers);
  const method = request.method.toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const origin = request.headers.get("origin");
    const expectedOrigin = new URL(request.url).origin;
    const fetchSite = request.headers.get("sec-fetch-site");
    const contentType = request.headers.get("content-type") || "";

    if ((origin && origin !== expectedOrigin) || fetchSite === "cross-site") {
      await appendAdminAuditEvent({
        type: "admin-api-blocked",
        detail: "Blocked cross-site admin API request.",
        ipHash: context.ipHash,
        userAgentHash: context.userAgentHash,
      });
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allowedContentTypes = options.allowedContentTypes || ["application/json"];

    if (!allowedContentTypes.some((allowedType) => contentType.includes(allowedType))) {
      return NextResponse.json({ error: "Unsupported body type" }, { status: 415 });
    }
  }

  const token = readCookie(request.headers.get("cookie"), ADMIN_SESSION_COOKIE);
  const session = await getAdminSessionFromToken(token, context);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    const url = new URL(request.url);
    await appendAdminAuditEvent({
      type: "admin-api-mutation",
      email: session.user.email,
      userId: session.user.id,
      detail: `${method} ${url.pathname}`,
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
    });
  }

  return null;
}

async function getChallengeFromCookie(purpose: "login" | "enroll") {
  const token = (await cookies()).get(ADMIN_CHALLENGE_COOKIE)?.value;
  const payload = verifyAdminChallengeToken(token);
  if (!payload || payload.purpose !== purpose) return null;

  const challenge = await getAdminChallenge(payload.cid);
  if (
    !challenge ||
    challenge.userId !== payload.uid ||
    challenge.purpose !== purpose ||
    new Date(challenge.expiresAt).getTime() <= Date.now()
  ) {
    return null;
  }

  const user = await getAdminUserById(challenge.userId);
  if (!user) return null;

  return { challenge, user };
}

export async function getPendingTotpSetup() {
  return getChallengeFromCookie("enroll");
}

export async function getPendingTotpLogin() {
  return getChallengeFromCookie("login");
}

export async function getAdminSetupState() {
  return {
    hasAdmin: await hasAdminUsers(),
    status: getAdminAuthStatus(),
  };
}

export async function bootstrapAdminAction(_state: AdminAuthFormState, formData: FormData): Promise<AdminAuthFormState> {
  const context = await getServerActionContext();
  const rate = await checkAdminRateLimit("bootstrap", context.ip, 5, 15 * 60);

  if (!rate.allowed) return { error: "Too many setup attempts. Wait a few minutes and try again." };
  if (await hasAdminUsers()) return { error: "Admin is already configured. Use the login page." };
  if (!authIsConfiguredForRuntime()) return { error: "Admin security is missing required environment settings." };

  const bootstrapToken = normalizeText(formData.get("bootstrapToken"));
  const expectedToken = process.env.ADMIN_BOOTSTRAP_TOKEN || "";

  if (!expectedToken || !safeStringEqual(bootstrapToken, expectedToken)) {
    await appendAdminAuditEvent({
      type: "bootstrap-failed",
      detail: "Invalid bootstrap token.",
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
    });
    return { error: "Setup token is not valid." };
  }

  const email = normalizeEmail(formData.get("email"));
  const name = normalizeText(formData.get("name")) || "SetuAI Admin";
  const password = String(formData.get("password") || "");
  const confirmPassword = String(formData.get("confirmPassword") || "");
  const problems = passwordProblems(password);

  if (!email.includes("@")) return { error: "Use a valid email address." };
  if (!isAdminEmailAllowed(email)) return { error: "This email is not on the admin allowlist." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (problems.length) return { error: problems.join(" ") };

  const user = await saveAdminUser({
    id: randomUUID(),
    email,
    name,
    role: "admin",
    passwordHash: await hashPassword(password),
    totpSecret: generateTotpSecret(),
    totpEnabled: false,
    failedLoginCount: 0,
    createdAt: now(),
    updatedAt: now(),
  });

  await createChallengeCookie({ user, purpose: "enroll", nextPath: "/admin", context });
  await appendAdminAuditEvent({
    type: "bootstrap-success",
    email,
    userId: user.id,
    ipHash: context.ipHash,
    userAgentHash: context.userAgentHash,
  });

  redirect("/admin/2fa/setup");
}

export async function loginAdminAction(_state: AdminAuthFormState, formData: FormData): Promise<AdminAuthFormState> {
  const context = await getServerActionContext();
  const email = normalizeEmail(formData.get("email"));
  const password = String(formData.get("password") || "");
  const nextPath = sanitizeNextPath(formData.get("next"));
  const [ipRate, emailRate] = await Promise.all([
    checkAdminRateLimit("login-ip", context.ip, 20, 15 * 60),
    checkAdminRateLimit("login-email", email || "blank", 8, 15 * 60),
  ]);

  if (!ipRate.allowed || !emailRate.allowed) {
    return { error: "Too many login attempts. Wait a few minutes and try again." };
  }

  if (!authIsConfiguredForRuntime()) return { error: "Admin security is not fully configured." };

  const user = await getAdminUserByEmail(email);
  const locked = user?.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now();
  const passwordOk = user && !locked && isAdminEmailAllowed(email) ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    if (user) {
      const failedLoginCount = user.failedLoginCount + 1;
      await saveAdminUser({
        ...user,
        failedLoginCount,
        lockedUntil:
          failedLoginCount >= 5
            ? new Date(Date.now() + PASSWORD_LOCK_MINUTES * 60 * 1000).toISOString()
            : user.lockedUntil,
      });
    }

    await appendAdminAuditEvent({
      type: "login-password-failed",
      email,
      userId: user?.id,
      detail: locked ? "Account locked." : "Invalid credentials.",
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
    });
    return { error: "Email, password, or access is not valid." };
  }

  const nextUser = await saveAdminUser({
    ...user,
    failedLoginCount: 0,
    lockedUntil: undefined,
    totpSecret: user.totpSecret || generateTotpSecret(),
  });
  const purpose = nextUser.totpEnabled ? "login" : "enroll";

  await createChallengeCookie({ user: nextUser, purpose, nextPath, context });
  await appendAdminAuditEvent({
    type: "login-password-success",
    email,
    userId: user.id,
    ipHash: context.ipHash,
    userAgentHash: context.userAgentHash,
  });

  redirect(purpose === "login" ? "/admin/2fa" : "/admin/2fa/setup");
}

async function verifyTotpAction(
  purpose: "login" | "enroll",
  _state: AdminAuthFormState,
  formData: FormData,
): Promise<AdminAuthFormState> {
  const context = await getServerActionContext();
  const pending = await getChallengeFromCookie(purpose);

  if (!pending) return { error: "Your verification window expired. Log in again." };

  const { challenge, user } = pending;
  const rate = await checkAdminRateLimit(`totp-${purpose}`, `${user.id}:${context.ip}`, 10, 10 * 60);
  if (!rate.allowed) return { error: "Too many code attempts. Wait a few minutes and try again." };

  if (challenge.attempts >= 5) {
    await clearChallenge(challenge.id);
    return { error: "Too many incorrect codes. Log in again." };
  }

  const code = normalizeText(formData.get("code"));
  const verified = user.totpSecret ? verifyTotpCode(user.totpSecret, code) : false;

  if (!verified) {
    await saveAdminChallenge({ ...challenge, attempts: challenge.attempts + 1 });
    await appendAdminAuditEvent({
      type: "totp-failed",
      email: user.email,
      userId: user.id,
      detail: purpose,
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
    });
    return { error: "Authenticator code is not valid." };
  }

  const authedUser = await saveAdminUser({
    ...user,
    totpEnabled: true,
    lastLoginAt: now(),
  });

  await createSessionCookie(authedUser, context);
  await clearChallenge(challenge.id);
  await appendAdminAuditEvent({
    type: "totp-success",
    email: authedUser.email,
    userId: authedUser.id,
    detail: purpose,
    ipHash: context.ipHash,
    userAgentHash: context.userAgentHash,
  });

  redirect(sanitizeNextPath(challenge.nextPath));
}

export async function verifyLoginTotpAction(state: AdminAuthFormState, formData: FormData) {
  return verifyTotpAction("login", state, formData);
}

export async function verifySetupTotpAction(state: AdminAuthFormState, formData: FormData) {
  return verifyTotpAction("enroll", state, formData);
}

export async function logoutAdminAction() {
  const context = await getServerActionContext();
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  const payload = verifyAdminSessionToken(token);

  if (payload) {
    await deleteAdminSession(payload.sid);
    await appendAdminAuditEvent({
      type: "logout",
      userId: payload.uid,
      ipHash: context.ipHash,
      userAgentHash: context.userAgentHash,
    });
  }

  (await cookies()).set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    secure: secureCookie(),
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  redirect("/admin/login");
}

export async function rejectIfAuthenticated() {
  const session = await getOptionalAdminSession();
  if (session) redirect("/admin");
}

export function assertChallengeFresh(challenge: AdminChallengeRecord | null, redirectTo = "/admin/login") {
  if (!challenge) redirect(redirectTo);
}
