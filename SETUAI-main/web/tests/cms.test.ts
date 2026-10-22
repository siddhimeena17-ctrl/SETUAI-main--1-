import { beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  values: new Map<string, unknown>(),
  hashes: new Map<string, Map<string, unknown>>(),
  send: vi.fn(),
  fail: false,
}));
vi.mock("@upstash/redis", () => ({
  Redis: class {
    async get(key: string) {
      if (state.fail) throw new Error("offline");
      return state.values.get(key) || null;
    }
    async set(key: string, value: unknown) {
      state.values.set(key, value);
      return "OK";
    }
    async hgetall(key: string) {
      if (state.fail) throw new Error("offline");
      return Object.fromEntries(state.hashes.get(key) || []);
    }
    async hget(key: string, id: string) {
      return state.hashes.get(key)?.get(id) || null;
    }
    async hsetnx(key: string, id: string, value: unknown) {
      if (state.fail) throw new Error("offline");
      const hash = state.hashes.get(key) || new Map();
      if (hash.has(id)) return 0;
      hash.set(id, value);
      state.hashes.set(key, hash);
      return 1;
    }
    async hset(key: string, values: Record<string, unknown>) {
      const hash = state.hashes.get(key) || new Map();
      Object.entries(values).forEach(([id, value]) => hash.set(id, value));
      state.hashes.set(key, hash);
      return 1;
    }
  },
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: state.send };
  },
}));
import {
  saveSubmission,
  getSubmissions,
  updateSubmission,
  createPendingSubscriber,
  confirmSubscriber,
  createUnsubscribeToken,
  unsubscribeSubscriber,
} from "@/lib/cms";
import { requestUpdateSubscription } from "@/lib/subscribers";
const inquiry = {
  formType: "beta",
  name: "Tester",
  email: "tester@example.org",
  organization: "",
  interest: "Individual",
  message: "",
  status: "new" as const,
  privacyAcknowledged: true,
  updatesOptIn: false,
};
beforeEach(() => {
  state.values.clear();
  state.hashes.clear();
  state.fail = false;
  state.send.mockReset();
  vi.stubEnv("UPSTASH_REDIS_REST_URL", "https://test.invalid");
  vi.stubEnv("UPSTASH_REDIS_REST_TOKEN", "test-only");
});
describe("durable submission records", () => {
  it("preserves simultaneous distinct submissions and deduplicates concurrent retries", async () => {
    const [first, repeated, second] = await Promise.all([
      saveSubmission(inquiry, "same"),
      saveSubmission(inquiry, "same"),
      saveSubmission({ ...inquiry, name: "Second" }, "different"),
    ]);
    expect(first.duplicate).toBe(false);
    expect(repeated.duplicate).toBe(true);
    expect(second.duplicate).toBe(false);
    expect(await getSubmissions()).toHaveLength(2);
  });
  it("keeps legacy submissions visible and updates without replacing the legacy collection", async () => {
    state.values.set("skypa:cms:submissions", [
      { ...inquiry, id: "old", createdAt: "2026-01-01", read: false },
    ]);
    await saveSubmission(inquiry, "new");
    await updateSubmission("old", { read: true, notificationStatus: "failed" });
    expect(await getSubmissions()).toHaveLength(2);
    expect(
      (await getSubmissions()).find((item) => item.id === "old")?.read,
    ).toBe(true);
    expect(
      (state.values.get("skypa:cms:submissions") as { read: boolean }[])[0]
        .read,
    ).toBe(false);
  });
  it("does not mask storage failure as an empty collection", async () => {
    state.fail = true;
    await expect(getSubmissions()).rejects.toThrow("offline");
  });
});
describe("separate newsletter consent", () => {
  it("requires confirmation and preserves unsubscribe behavior", async () => {
    const pending = await createPendingSubscriber({
      email: "tester@example.org",
      source: "updates-page",
    });
    expect(pending.subscriber.active).toBe(false);
    expect(await confirmSubscriber("wrong-token")).toBeNull();
    expect((await confirmSubscriber(pending.confirmationToken!))?.active).toBe(
      true,
    );
    const token = await createUnsubscribeToken(pending.subscriber.id);
    expect((await unsubscribeSubscriber(token!))?.active).toBe(false);
  });
  it("reports a returned provider error without claiming confirmation was sent", async () => {
    vi.stubEnv("RESEND_API_KEY", "test-only");
    vi.stubEnv("UPDATES_FROM_EMAIL", "updates@verified.example");
    state.send.mockResolvedValue({
      data: null,
      error: { message: "rejected" },
    });
    expect(
      await requestUpdateSubscription({ email: "tester@example.org" }),
    ).toMatchObject({ stored: true, confirmationSent: false });
  });
});
