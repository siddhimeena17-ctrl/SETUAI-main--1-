import { beforeEach, describe, expect, it, vi } from "vitest";
const mock = vi.hoisted(() => ({
  send: vi.fn(),
  lock: vi.fn(),
  release: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
}));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: mock.send };
  },
}));
vi.mock("@/lib/cms", () => ({
  acquireNotificationLock: mock.lock,
  releaseNotificationLock: mock.release,
  getSubmission: mock.get,
  updateSubmission: mock.update,
}));
import { notifySubmission } from "@/lib/inquiry-email";
const submission = {
  id: "saved-1",
  formType: "chapter",
  name: "Test <Applicant>",
  email: "applicant@example.org",
  organization: "Test School",
  interest: "School",
  message: "<script>test</script>",
  fields: { city: "Test City" },
  sourcePage: "/chapters",
  createdAt: "2026-10-21T12:00:00Z",
  notificationStatus: "pending",
};
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("RESEND_API_KEY", "test-only");
  vi.stubEnv("INQUIRY_FROM_EMAIL", "SetuAI <inquiries@verified.example>");
  vi.stubEnv("INQUIRY_NOTIFY_TO", "old-inbox@example.org");
  mock.lock.mockResolvedValue("lock-token");
  mock.get.mockResolvedValue(submission);
  mock.update.mockResolvedValue({});
  mock.send.mockResolvedValue({ data: { id: "provider-1" }, error: null });
});
describe("inquiry notifications", () => {
  it("routes to the required inbox with validated Reply-To, provenance, and safe HTML", async () => {
    expect(await notifySubmission(submission.id)).toEqual({ status: "sent" });
    const [mail, options] = mock.send.mock.calls[0];
    expect(mail).toMatchObject({
      from: "SetuAI <inquiries@verified.example>",
      to: "setuai.edu@gmail.com",
      replyTo: submission.email,
    });
    expect(mail.subject).toContain("[SetuAI Chapter Application]");
    expect(mail.text).toContain("/chapters");
    expect(mail.text).toContain("2026-10-21T12:00:00Z");
    expect(mail.text).toContain("Test City");
    expect(mail.html).toContain("&lt;script&gt;");
    expect(options.idempotencyKey).toBe("setuai-saved-1");
    expect(mock.update).toHaveBeenCalledWith(
      "saved-1",
      expect.objectContaining({
        notificationStatus: "sent",
        providerMessageId: "provider-1",
      }),
    );
  });
  it("records returned provider failures as retryable rather than sent", async () => {
    mock.send.mockResolvedValue({
      data: null,
      error: { message: "Provider rejected sender" },
    });
    expect(await notifySubmission(submission.id)).toEqual({
      status: "pending",
    });
    expect(mock.update).toHaveBeenCalledWith(
      "saved-1",
      expect.objectContaining({
        notificationStatus: "failed",
        notificationError: "Provider rejected sender",
      }),
    );
    expect(mock.release).toHaveBeenCalled();
  });
  it("records missing configuration and never spoofs Gmail or the applicant as sender", async () => {
    vi.stubEnv("INQUIRY_FROM_EMAIL", "setuai.edu@gmail.com");
    expect(await notifySubmission(submission.id)).toEqual({
      status: "pending",
    });
    expect(mock.send).not.toHaveBeenCalled();
  });
  it("does not resend already accepted notifications or compete with a pending send", async () => {
    mock.get.mockResolvedValue({ ...submission, notificationStatus: "sent" });
    expect(await notifySubmission(submission.id)).toEqual({ status: "sent" });
    expect(mock.send).not.toHaveBeenCalled();
    mock.lock.mockResolvedValue(null);
    expect(await notifySubmission(submission.id)).toEqual({
      status: "pending",
    });
    expect(mock.send).not.toHaveBeenCalled();
  });
  it("leaves a recoverable record if provider acceptance is followed by a storage error", async () => {
    mock.update
      .mockRejectedValueOnce(new Error("Status write failed"))
      .mockResolvedValueOnce({});
    expect(await notifySubmission(submission.id)).toEqual({
      status: "pending",
    });
    expect(mock.update).toHaveBeenLastCalledWith(
      "saved-1",
      expect.objectContaining({ notificationStatus: "failed" }),
    );
  });
});
