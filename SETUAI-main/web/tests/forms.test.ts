import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  submit: vi.fn(),
  content: vi.fn(),
  rate: vi.fn(),
  subscribe: vi.fn(),
}));
vi.mock("@/lib/cms", () => ({ getSiteContent: mock.content }));
vi.mock("@/lib/formspree", () => ({
  submitToFormspree: mock.submit,
  FormspreeError: class extends Error {
    constructor(public status: number) {
      super("Provider failed");
    }
  },
}));
vi.mock("@/lib/security", () => ({
  checkPublicRateLimit: mock.rate,
  rateLimitResponse: () => Response.json({ error: "rate" }, { status: 429 }),
}));
vi.mock("@/lib/subscribers", () => ({
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  requestUpdateSubscription: mock.subscribe,
}));
vi.mock("@/lib/observability", () => ({ logRouteError: vi.fn() }));
import { POST } from "@/app/api/forms/route";
import { defaultInitiatives } from "@/content/initiatives";
import { FormspreeError } from "@/lib/formspree";
function send(type = "contact", changes = {}, extra = {}) {
  return POST(
    new Request("https://setuai.org/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: type,
        payload: {
          name: "Test Applicant",
          email: "applicant@example.org",
          organization: "Test School",
          interest: "General question",
          message: "Test inquiry",
          privacyAcknowledged: "on",
          ...changes,
        },
        sourcePage: "/contact",
        ...extra,
      }),
    }),
  );
}
beforeEach(() => {
  vi.resetAllMocks();
  mock.rate.mockResolvedValue({ allowed: true });
  mock.content.mockResolvedValue({
    initiatives: structuredClone(defaultInitiatives),
  });
  mock.submit.mockResolvedValue({ submissionId: "saved", duplicate: false });
  mock.subscribe.mockResolvedValue({ confirmationSent: true });
});
describe("Formspree application boundary", () => {
  it("validates chapter-specific required fields and privacy before sending", async () => {
    expect((await send("chapter", { city: "Delhi" })).status).toBe(400);
    expect((await send("contact", { privacyAcknowledged: false })).status).toBe(
      400,
    );
    expect(mock.submit).not.toHaveBeenCalled();
  });
  it("preserves chapter fields and source, without adding marketing consent", async () => {
    const response = await send(
      "chapter",
      {
        city: "Delhi",
        country: "India",
        setting: "School",
        motivation: "Local learning",
        activities: "Learning sessions",
        updatesOptIn: "on",
        _to: "someone@example.org",
      },
      { sourcePage: "/chapters" },
    );
    expect(response.status).toBe(200);
    expect(mock.submit.mock.calls[0][0]).toMatchObject({
      formType: "chapter",
      sourcePage: "/chapters",
      fields: { city: "Delhi", activities: "Learning sessions" },
      updatesOptIn: false,
    });
    expect(mock.submit.mock.calls[0][0].fields).not.toHaveProperty("_to");
    expect(mock.subscribe).not.toHaveBeenCalled();
  });
  it("supports beta requests without a message or organization", async () => {
    expect(
      (
        await send("beta", {
          organization: "",
          message: "",
          role: "Educator",
          participation: "Individual",
        })
      ).status,
    ).toBe(200);
  });
  it("respects paused application settings", async () => {
    const content = structuredClone(defaultInitiatives);
    content.platform.betaOpen = false;
    mock.content.mockResolvedValue({ initiatives: content });
    expect(
      (await send("beta", { role: "Educator", participation: "Individual" }))
        .status,
    ).toBe(409);
    expect(mock.submit).not.toHaveBeenCalled();
  });
  it("does not depend on Redis and never claims inbox delivery", async () => {
    const result = await (await send()).json();
    expect(result).toMatchObject({
      ok: true,
      notification: "managed",
      submissionId: "saved",
    });
    expect(
      mock.rate.mock.calls.every(([options]) => options.storage === "memory"),
    ).toBe(true);
  });
  it("keeps a received inquiry successful when separate newsletter confirmation fails", async () => {
    mock.subscribe.mockRejectedValue(new Error("Newsletter unavailable"));
    expect(
      await (await send("contact", { updatesOptIn: "on" })).json(),
    ).toMatchObject({ ok: true, subscription: "pending" });
  });
  it("shows provider failure and capacity errors without reporting success or subscribing", async () => {
    mock.submit.mockRejectedValue(new Error("Provider offline"));
    expect((await send("contact", { updatesOptIn: "on" })).status).toBe(503);
    expect(mock.subscribe).not.toHaveBeenCalled();
    mock.submit.mockRejectedValue(new FormspreeError(429));
    const response = await send();
    expect(response.status).toBe(429);
    expect(response.headers.get("Retry-After")).toBe("60");
  });
  it("uses a stable reference across reloads and skips duplicate newsletter requests", async () => {
    await send();
    await send();
    expect(mock.submit.mock.calls[0][1]).toBe(mock.submit.mock.calls[1][1]);
    mock.submit.mockResolvedValue({ submissionId: "saved", duplicate: true });
    await send("contact", { updatesOptIn: "on" });
    expect(mock.subscribe).not.toHaveBeenCalled();
  });
  it("preserves honeypot protection, rate limits, and length limits", async () => {
    expect((await send("contact", { companyWebsite: "spam" })).status).toBe(
      200,
    );
    expect(mock.submit).not.toHaveBeenCalled();
    expect((await send("contact", { name: "a".repeat(121) })).status).toBe(400);
    mock.rate.mockResolvedValue({ allowed: false });
    expect((await send()).status).toBe(429);
  });
});
