import { createHash } from "node:crypto";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

type RateLimitOptions = {
  request: Request;
  scope: string;
  limit: number;
  windowSeconds: number;
  identifier?: string;
};

type MemoryRateLimit = {
  count: number;
  resetAt: number;
};

const memoryRateLimits = new Map<string, MemoryRateLimit>();

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function getClientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function hashIdentifier(value: string) {
  return createHash("sha256").update(value || "unknown").digest("hex");
}

export function clampText(value: unknown, maxLength: number) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export async function checkPublicRateLimit({
  request,
  scope,
  limit,
  windowSeconds,
  identifier,
}: RateLimitOptions) {
  const identity = identifier || getClientIp(request);
  const key = `skypa:public:rate:${scope}:${hashIdentifier(identity)}`;
  const client = redis();

  if (client) {
    const count = await client.incr(key);
    if (count === 1) await client.expire(key, windowSeconds);

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      retryAfter: windowSeconds,
    };
  }

  const now = Date.now();
  const current = memoryRateLimits.get(key);

  if (!current || current.resetAt <= now) {
    memoryRateLimits.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return { allowed: true, remaining: limit - 1, retryAfter: windowSeconds };
  }

  current.count += 1;
  memoryRateLimits.set(key, current);

  return {
    allowed: current.count <= limit,
    remaining: Math.max(0, limit - current.count),
    retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function rateLimitResponse(retryAfter: number) {
  return NextResponse.json(
    { error: "Too many requests. Please wait a moment and try again." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    },
  );
}
