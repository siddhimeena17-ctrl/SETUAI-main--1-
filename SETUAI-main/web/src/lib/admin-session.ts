import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_SESSION_COOKIE = "skypa_admin_session";
export const ADMIN_CHALLENGE_COOKIE = "skypa_admin_challenge";

export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;
export const ADMIN_CHALLENGE_TTL_SECONDS = 60 * 10;

type SignedPayload = {
  kind: "session" | "challenge";
  exp: number;
  ver: 1;
};

export type AdminSessionPayload = SignedPayload & {
  kind: "session";
  sid: string;
  uid: string;
  role: "admin";
};

export type AdminChallengePayload = SignedPayload & {
  kind: "challenge";
  cid: string;
  uid: string;
  purpose: "login" | "enroll";
};

function base64UrlEncode(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string) {
  return Buffer.from(input, "base64url").toString("utf8");
}

function getSigningSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV !== "production") {
    return "development-only-skypa-admin-session-secret-change-before-deploy";
  }

  return null;
}

export function getAdminSessionSecretStatus() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return { configured: false, strong: process.env.NODE_ENV !== "production" };
  return { configured: true, strong: secret.length >= 32 };
}

function signMessage(message: string) {
  const secret = getSigningSecret();
  if (!secret) return null;

  return createHmac("sha256", secret).update(message).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const aBuffer = Buffer.from(a);
  const bBuffer = Buffer.from(b);

  if (aBuffer.length !== bBuffer.length) {
    const aHash = createHmac("sha256", "length-check").update(a).digest();
    const bHash = createHmac("sha256", "length-check").update(b).digest();
    timingSafeEqual(aHash, bHash);
    return false;
  }

  return timingSafeEqual(aBuffer, bBuffer);
}

function signPayload(payload: SignedPayload) {
  const body = base64UrlEncode(JSON.stringify(payload));
  const signature = signMessage(body);
  if (!signature) throw new Error("Admin session signing is not configured.");
  return `${body}.${signature}`;
}

function verifyPayload<T extends SignedPayload>(token: string | undefined, kind: T["kind"]) {
  if (!token) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = signMessage(body);
  if (!expected || !safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(body)) as T;
    if (payload.kind !== kind || payload.ver !== 1 || payload.exp <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function signAdminSession(payload: Omit<AdminSessionPayload, "kind" | "ver">) {
  return signPayload({ ...payload, kind: "session", ver: 1 });
}

export function verifyAdminSessionToken(token: string | undefined) {
  return verifyPayload<AdminSessionPayload>(token, "session");
}

export function signAdminChallenge(payload: Omit<AdminChallengePayload, "kind" | "ver">) {
  return signPayload({ ...payload, kind: "challenge", ver: 1 });
}

export function verifyAdminChallengeToken(token: string | undefined) {
  return verifyPayload<AdminChallengePayload>(token, "challenge");
}
