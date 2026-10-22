import type { FormType } from "@/content/form-fields";
import type { CmsSubmission } from "@/lib/cms";
import { inquirySubject } from "@/lib/inquiry-subject";

// Public form IDs, created in the SetuAI-owned Formspree account. Notification
// recipients are configured there; applicants cannot override them in a POST.
export const formspreeForms: Record<FormType, string> = {
  contact: "xrpendqj",
  school: "mbgdnbob",
  nonprofit: "xdeaqjgq",
  volunteer: "mqperjbk",
  sponsor: "mljgqvnd",
  chapter: "mzednwge",
  textbook: "xoejgbww",
  beta: "mgaogqyz",
};

export const formspreeProjectUrl =
  "https://formspree.io/projects/3117901080550178574/overview";

export class FormspreeError extends Error {
  constructor(public readonly status: number) {
    super("Formspree did not confirm the submission.");
    this.name = "FormspreeError";
  }
}

type SubmissionInput = Omit<CmsSubmission, "id" | "createdAt" | "read">;
type Receipt = { submissionId: string; duplicate: boolean };
const recent = new Map<
  string,
  { expiresAt: number; receipt: Promise<Receipt> }
>();
const retryWindowMs = 15 * 60 * 1000;

async function deliver(input: SubmissionInput, fingerprint: string) {
  const id = formspreeForms[input.formType as FormType];
  if (!id) throw new FormspreeError(400);
  const response = await fetch(`https://formspree.io/f/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      ...input.fields,
      subject: inquirySubject(input),
      name: input.name,
      email: input.email,
      organization: input.organization,
      interest: input.interest,
      message: input.message,
      form_type: input.formType,
      source_page: input.sourcePage,
      submitted_at: new Date().toISOString(),
      submission_id: `inquiry-${fingerprint}`,
      privacy_acknowledged: input.privacyAcknowledged ? "yes" : "no",
      updates_requested: input.updatesOptIn
        ? "yes - separate confirmation required"
        : "no",
    }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  const result = await response.json().catch(() => null);
  // A successful HTTP response alone is insufficient: challenge/error pages
  // must never cause the website to display a successful receipt.
  if (!response.ok || result?.ok !== true) {
    throw new FormspreeError(response.ok ? 502 : response.status);
  }
  return { submissionId: `inquiry-${fingerprint}`, duplicate: false };
}

export async function submitToFormspree(
  input: SubmissionInput,
  fingerprint: string,
): Promise<Receipt> {
  const now = Date.now();
  for (const [key, entry] of recent) {
    if (entry.expiresAt <= now) recent.delete(key);
  }
  const existing = recent.get(fingerprint);
  if (existing) return { ...(await existing.receipt), duplicate: true };
  // This coalesces concurrent requests and short retries on a warm instance.
  // The fingerprint is also saved in Formspree for cross-instance review.
  // Formspree does not provide a documented durable idempotency guarantee.
  if (recent.size >= 1000) recent.delete(recent.keys().next().value!);
  const receipt = deliver(input, fingerprint);
  recent.set(fingerprint, { expiresAt: now + retryWindowMs, receipt });
  try {
    return await receipt;
  } catch (error) {
    recent.delete(fingerprint);
    throw error;
  }
}
