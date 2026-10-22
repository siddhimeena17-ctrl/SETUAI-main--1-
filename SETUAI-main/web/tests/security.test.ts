import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@upstash/redis", () => ({
  Redis: class {
    constructor() {
      throw new Error("Redis unavailable");
    }
  },
}));
import { checkPublicRateLimit } from "@/lib/security";
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe("independent inquiry rate limits", () => {
  it("limits requests and expires its window even when Redis is unavailable", async () => {
    vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test.invalid");
    vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only");
    vi.useFakeTimers();
    const options = {
      request: new Request("https://setuai.org/api/forms"),
      scope: "forms-test",
      limit: 2,
      windowSeconds: 60,
      storage: "memory" as const,
    };
    expect((await checkPublicRateLimit(options)).allowed).toBe(true);
    expect((await checkPublicRateLimit(options)).allowed).toBe(true);
    expect((await checkPublicRateLimit(options)).allowed).toBe(false);
    vi.advanceTimersByTime(61000);
    expect((await checkPublicRateLimit(options)).allowed).toBe(true);
    await expect(
      checkPublicRateLimit({ ...options, storage: "redis" }),
    ).rejects.toThrow("Redis unavailable");
  });
});
