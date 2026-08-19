import { Resend } from "resend";
import { createPendingSubscriber } from "@/lib/cms";
import { absoluteUrl } from "@/lib/utils";

export type SubscriberSource = "updates-page" | "school" | "volunteer" | "sponsor" | "contact" | "manual";

type SubscriberInput = {
  email: string;
  name?: string;
  source?: SubscriberSource;
};

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getMailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.UPDATES_FROM_EMAIL;
  return apiKey && from ? { apiKey, from } : null;
}

export async function requestUpdateSubscription({ email, name = "", source = "updates-page" }: SubscriberInput) {
  const normalizedEmail = normalizeEmail(email);
  if (!isValidEmail(normalizedEmail)) return { stored: false, reason: "invalid-email" as const };

  const pending = await createPendingSubscriber({ email: normalizedEmail, name, source });
  if (pending.alreadyConfirmed) return { stored: true, confirmationSent: false, alreadyConfirmed: true };

  const configuration = getMailConfiguration();
  if (!configuration || !pending.confirmationToken) {
    return { stored: true, confirmationSent: false, reason: "email-not-configured" as const };
  }

  const confirmUrl = absoluteUrl(`/api/updates/confirm?token=${encodeURIComponent(pending.confirmationToken)}`);
  const safeName = escapeHtml(name.trim() || "there");
  const resend = new Resend(configuration.apiKey);

  try {
    await resend.emails.send({
      from: configuration.from,
      to: normalizedEmail,
      subject: "Confirm your SetuAI updates subscription",
      html: `<p>Hello ${safeName},</p><p>Please confirm that you want to receive SetuAI progress updates.</p><p><a href="${confirmUrl}">Confirm updates subscription</a></p><p>If you did not request this, you can ignore this email.</p>`,
      text: `Hello ${name.trim() || "there"},\n\nPlease confirm that you want to receive SetuAI progress updates:\n${confirmUrl}\n\nIf you did not request this, you can ignore this email.`,
    });
    return { stored: true, confirmationSent: true, alreadyConfirmed: false };
  } catch {
    return { stored: true, confirmationSent: false, reason: "email-send-failed" as const };
  }
}
