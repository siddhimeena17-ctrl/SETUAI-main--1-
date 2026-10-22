import { Resend } from "resend";
import {
  acquireNotificationLock,
  getSubmission,
  releaseNotificationLock,
  updateSubmission,
  type CmsSubmission,
} from "@/lib/cms";

export const inquiryRecipient = "setuai.edu@gmail.com";
export function inquirySubject(input: CmsSubmission) {
  const labels: Record<string, string> = {
    chapter: "Chapter Application",
    beta: "Platform Beta",
    textbook: "Textbook Inquiry",
    school: "School Inquiry",
    nonprofit: "Nonprofit Inquiry",
    volunteer: "Volunteer Inquiry",
    sponsor: "Sponsorship Inquiry",
    contact: "Contact",
  };
  return `[SetuAI ${labels[input.formType] || "Inquiry"}] ${input.formType === "textbook" ? input.organization || input.name : input.name}${input.formType === "chapter" && input.organization ? ` — ${input.organization}` : ""}`;
}
function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
export async function notifySubmission(id: string) {
  const token = await acquireNotificationLock(id);
  if (!token) return { status: "pending" as const };
  try {
    const input = await getSubmission(id);
    if (!input) throw new Error("Submission not found");
    if (input.notificationStatus === "sent") return { status: "sent" as const };
    try {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.INQUIRY_FROM_EMAIL;
      if (!apiKey || !from)
        throw new Error(
          "Configure RESEND_API_KEY and a verified INQUIRY_FROM_EMAIL sender.",
        );
      if (/@gmail\.com[>\s]*$/i.test(from) || from.includes(input.email))
        throw new Error(
          "Use a verified organization-domain sender, not the applicant or a Gmail address.",
        );
      const fields = [
        ["Form type", input.formType],
        ["Name", input.name],
        ["Email", input.email],
        ["Organization", input.organization || "Not provided"],
        ["Interest", input.interest || "Not provided"],
        ["Message", input.message || "Not provided"],
        ...Object.entries(input.fields || {}),
        ["Timestamp (UTC)", input.createdAt],
        ["Source page", input.sourcePage || "Not recorded"],
        ["Submission ID", input.id],
      ];
      const result = await new Resend(apiKey).emails.send(
        {
          from,
          to: inquiryRecipient,
          replyTo: input.email,
          subject: inquirySubject(input),
          text: fields
            .map(([label, value]) => `${label}: ${value}`)
            .join("\n\n"),
          html: `<h1>SetuAI ${escapeHtml(input.formType)}</h1>${fields.map(([label, value]) => `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`).join("")}`,
        },
        { idempotencyKey: `setuai-${input.id}` },
      );
      if (result.error || !result.data?.id)
        throw new Error(
          result.error?.message ||
            "The email provider did not accept the notification.",
        );
      await updateSubmission(id, {
        notificationStatus: "sent",
        notificationError: "",
        notifiedAt: new Date().toISOString(),
        providerMessageId: result.data.id,
      });
      return { status: "sent" as const };
    } catch (error) {
      await updateSubmission(id, {
        notificationStatus: "failed",
        notificationError:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "Email notification failed",
      });
      return { status: "pending" as const };
    }
  } finally {
    await releaseNotificationLock(id, token);
  }
}
