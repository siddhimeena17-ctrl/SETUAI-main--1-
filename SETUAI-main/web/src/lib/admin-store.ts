import { createHash, randomUUID } from "crypto";
import { Redis } from "@upstash/redis";

export type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: "admin";
  passwordHash: string;
  totpSecret: string;
  totpEnabled: boolean;
  failedLoginCount: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
};

export type AdminSessionRecord = {
  id: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  ipHash: string;
  userAgentHash: string;
};

export type AdminChallengeRecord = {
  id: string;
  userId: string;
  purpose: "login" | "enroll";
  nextPath: string;
  attempts: number;
  createdAt: string;
  expiresAt: string;
  ipHash: string;
  userAgentHash: string;
};

export type AdminAuditEvent = {
  id: string;
  type:
    | "bootstrap-success"
    | "bootstrap-failed"
    | "login-password-success"
    | "login-password-failed"
    | "totp-success"
    | "totp-failed"
    | "logout"
    | "admin-api-blocked"
    | "admin-api-mutation";
  email?: string;
  userId?: string;
  detail?: string;
  ipHash: string;
  userAgentHash: string;
  createdAt: string;
  prevHash?: string;
  hash?: string;
};

const keys = {
  users: "skypa:admin:users",
  audit: "skypa:admin:audit",
  sessions: "skypa:admin:sessions:",
  challenges: "skypa:admin:challenges:",
  rate: "skypa:admin:rate:",
};

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}

function requireRedis() {
  const client = redis();
  if (!client) throw new Error("Upstash Redis is required for admin authentication.");
  return client;
}

function parseStored<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
}

function now() {
  return new Date().toISOString();
}

function secondsUntil(date: string) {
  return Math.max(1, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
}

export function isAdminStoreConfigured() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

export function hashAdminIdentifier(value: string) {
  return createHash("sha256").update(value || "unknown").digest("hex");
}

export async function getAdminUsers() {
  const client = redis();
  if (!client) return [];
  return parseStored<AdminUser[]>(await client.get(keys.users)) || [];
}

export async function hasAdminUsers() {
  return (await getAdminUsers()).length > 0;
}

export async function getAdminUserById(id: string) {
  return (await getAdminUsers()).find((user) => user.id === id) || null;
}

export async function getAdminUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return (await getAdminUsers()).find((user) => user.email === normalizedEmail) || null;
}

export async function saveAdminUser(user: AdminUser) {
  const client = requireRedis();
  const users = await getAdminUsers();
  const nextUser = { ...user, updatedAt: now() };
  await client.set(keys.users, [nextUser, ...users.filter((item) => item.id !== nextUser.id)]);
  return nextUser;
}

export async function createAdminSession(record: Omit<AdminSessionRecord, "id" | "createdAt">) {
  const client = requireRedis();
  const session: AdminSessionRecord = {
    id: randomUUID(),
    createdAt: now(),
    ...record,
  };
  await client.set(`${keys.sessions}${session.id}`, session, { ex: secondsUntil(session.expiresAt) });
  return session;
}

export async function getAdminSession(id: string) {
  const client = redis();
  if (!client) return null;
  return parseStored<AdminSessionRecord>(await client.get(`${keys.sessions}${id}`));
}

export async function deleteAdminSession(id: string) {
  const client = redis();
  if (!client) return;
  await client.del(`${keys.sessions}${id}`);
}

export async function createAdminChallenge(record: Omit<AdminChallengeRecord, "id" | "createdAt" | "attempts">) {
  const client = requireRedis();
  const challenge: AdminChallengeRecord = {
    id: randomUUID(),
    createdAt: now(),
    attempts: 0,
    ...record,
  };
  await client.set(`${keys.challenges}${challenge.id}`, challenge, { ex: secondsUntil(challenge.expiresAt) });
  return challenge;
}

export async function getAdminChallenge(id: string) {
  const client = redis();
  if (!client) return null;
  return parseStored<AdminChallengeRecord>(await client.get(`${keys.challenges}${id}`));
}

export async function saveAdminChallenge(challenge: AdminChallengeRecord) {
  const client = requireRedis();
  await client.set(`${keys.challenges}${challenge.id}`, challenge, { ex: secondsUntil(challenge.expiresAt) });
  return challenge;
}

export async function deleteAdminChallenge(id: string) {
  const client = redis();
  if (!client) return;
  await client.del(`${keys.challenges}${id}`);
}

export async function checkAdminRateLimit(scope: string, identifier: string, limit: number, windowSeconds: number) {
  const client = redis();
  if (!client) return { allowed: false, remaining: 0 };

  const key = `${keys.rate}${scope}:${hashAdminIdentifier(identifier)}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, windowSeconds);

  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

export async function appendAdminAuditEvent(event: Omit<AdminAuditEvent, "id" | "createdAt" | "prevHash" | "hash">) {
  const client = redis();
  if (!client) return;

  const events = parseStored<AdminAuditEvent[]>(await client.get(keys.audit)) || [];
  const prevHash = events.find((storedEvent) => storedEvent.hash)?.hash || "";
  const nextEvent: AdminAuditEvent = {
    id: randomUUID(),
    createdAt: now(),
    prevHash,
    ...event,
  };
  nextEvent.hash = hashAuditEvent(nextEvent);

  await client.set(keys.audit, [nextEvent, ...events].slice(0, 100));
}

export async function getAdminAuditEvents() {
  const client = redis();
  if (!client) return [];
  return parseStored<AdminAuditEvent[]>(await client.get(keys.audit)) || [];
}

function hashAuditEvent(event: AdminAuditEvent) {
  const { hash, ...eventWithoutHash } = event;
  void hash;
  return createHash("sha256").update(JSON.stringify(eventWithoutHash)).digest("hex");
}

export function verifyAdminAuditChain(events: AdminAuditEvent[]) {
  const hashedEvents = events.filter((event) => event.hash).slice().reverse();
  let expectedPrevHash = "";

  for (const event of hashedEvents) {
    if ((event.prevHash || "") !== expectedPrevHash) {
      return { verified: false, checked: hashedEvents.length, legacy: events.length - hashedEvents.length };
    }

    if (hashAuditEvent(event) !== event.hash) {
      return { verified: false, checked: hashedEvents.length, legacy: events.length - hashedEvents.length };
    }

    expectedPrevHash = event.hash || "";
  }

  return {
    verified: hashedEvents.length > 0,
    checked: hashedEvents.length,
    legacy: events.length - hashedEvents.length,
  };
}
