import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  save: vi.fn(),
  content: vi.fn(),
  notify: vi.fn(),
  rate: vi.fn(),
  subscribe: vi.fn(),
}));
vi.mock("@/lib/cms", () => ({
  saveSubmission: mock.save,
  getSiteContent: mock.content,
}));
vi.mock("@/lib/inquiry-email", () => ({ notifySubmission: mock.notify }));
vi.mock("@/lib/security", () => ({
  checkPublicRateLimit: mock.rate,
  rateLimitResponse: () => Response.json({ error: "rate" }, { status: 429 }),
}));
vi.mock("@/lib/subscribers", () => ({
  isValidEmail: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
  requestUpdateSubscription: mock.subscribe,
}));
import { POST } from "@/app/api/forms/route";
import { defaultInitiatives } from "@/content/initiatives";
function send(type = "contact", changes = {}, extra = {}) {
  const payload = {
    name: "Test Applicant",
    email: "applicant@example.org",
    organization: "Test School",
    interest: "General question",
    message: "Test inquiry",
    privacyAcknowledged: "on",
    ...changes,
  };
  return POST(
    new Request("https://setuai.org/api/forms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        formType: type,
        payload,
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
  mock.save.mockResolvedValue({
    submission: { id: "saved", notificationStatus: "pending" },
    duplicate: false,
  });
  mock.notify.mockResolvedValue({ status: "sent" });
  mock.subscribe.mockResolvedValue({ confirmationSent: true });
});
describe("public application boundary", () => {
  it("validates chapter-specific required fields and privacy", async () => {
    expect((await send("chapter", { city: "Delhi" })).status).toBe(400);
    expect((await send("contact", { privacyAcknowledged: false })).status).toBe(
      400,
    );
    expect(mock.save).not.toHaveBeenCalled();
  });
  it("stores all chapter fields without subscribing the applicant", async () => {
    const response = await send(
      "chapter",
      {
        city: "Delhi",
        country: "India",
        setting: "School",
        motivation: "Local learning",
        activities: "Learning sessions",
        updatesOptIn: "on",
      },
      { sourcePage: "/chapters" },
    );
    expect(response.status).toBe(200);
    expect(mock.save.mock.calls[0][0]).toMatchObject({
      formType: "chapter",
      sourcePage: "/chapters",
      fields: { city: "Delhi", activities: "Learning sessions" },
      updatesOptIn: false,
    });
    expect(mock.subscribe).not.toHaveBeenCalled();
  });
  it("supports beta requests without requiring a message or organization", async () => {
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
    expect(mock.save).not.toHaveBeenCalled();
  });
  it("keeps the saved request successful when email or separate newsletter delivery fails", async () => {
    mock.notify.mockRejectedValue(new Error("Provider unavailable"));
    mock.subscribe.mockRejectedValue(new Error("Newsletter unavailable"));
    const result = await (await send("contact", { updatesOptIn: "on" })).json();
    expect(result).toMatchObject({
      ok: true,
      notification: "pending",
      subscription: "pending",
      submissionId: "saved",
    });
  });
  it("sends no email when storage fails and allows an honest retry", async () => {
    mock.save.mockRejectedValue(new Error("Storage offline"));
    expect((await send()).status).toBe(503);
    expect(mock.notify).not.toHaveBeenCalled();
  });
  it("uses the same fingerprint across reloads and does not repeat newsletter requests", async () => {
    await send();
    await send();
    expect(mock.save.mock.calls[0][1]).toBe(mock.save.mock.calls[1][1]);
    mock.save.mockResolvedValue({
      submission: { id: "saved", notificationStatus: "sent" },
      duplicate: true,
    });
    await send("contact", { updatesOptIn: "on" });
    expect(mock.subscribe).not.toHaveBeenCalled();
  });
  it("preserves honeypot protection, rate limits, and field length validation", async () => {
    expect((await send("contact", { companyWebsite: "spam" })).status).toBe(
      200,
    );
    expect(mock.save).not.toHaveBeenCalled();
    expect((await send("contact", { name: "a".repeat(121) })).status).toBe(400);
    mock.rate.mockResolvedValue({ allowed: false });
    expect((await send()).status).toBe(429);
  });
});
