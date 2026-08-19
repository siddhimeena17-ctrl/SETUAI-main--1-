import { Resend } from "resend";
import { NextResponse } from "next/server";
import { saveSubmission } from "@/lib/cms";
import { checkPublicRateLimit, clampText, rateLimitResponse } from "@/lib/security";
import { isValidEmail, requestUpdateSubscription } from "@/lib/subscribers";
import { logRouteInfo } from "@/lib/observability";

type FormPayload = {
  formType?: string;
  payload?: Record<string, unknown>;
};

const allowedFormTypes = new Set(["school", "volunteer", "sponsor", "contact"]);

export const runtime = "nodejs";

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function notifyInquiry(input: { formType: string; name: string; email: string; organization: string; interest: string; message: string }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.INQUIRY_FROM_EMAIL;
  const to = process.env.INQUIRY_NOTIFY_TO;
  if (!apiKey || !from || !to) return;

  const resend = new Resend(apiKey);
  const fields = [
    ["Name", input.name],
    ["Email", input.email],
    ["Organization", input.organization || "Not provided"],
    ["Interest", input.interest || "Not provided"],
    ["Message", input.message],
  ];
  const html = `<h1>New SetuAI inquiry</h1><p><strong>Type:</strong> ${escapeHtml(input.formType)}</p>${fields.map(([label, value]) => `<p><strong>${label}:</strong> ${escapeHtml(value)}</p>`).join("")}`;
  await resend.emails.send({ from, to, subject: `New SetuAI inquiry: ${input.formType}`, html, text: fields.map(([label, value]) => `${label}: ${value}`).join("\n") });
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const ipRate = await checkPublicRateLimit({
    request,
    scope: "forms-ip",
    limit: 8,
    windowSeconds: 15 * 60,
  });

  if (!ipRate.allowed) return rateLimitResponse(ipRate.retryAfter);

  const body = (await request.json().catch(() => null)) as FormPayload | null;

  if (!body?.formType || !allowedFormTypes.has(body.formType) || !body.payload) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }

  const payload = body.payload;
  const honeypot = clampText(payload.companyWebsite || payload.website, 120);

  if (honeypot) {
    return NextResponse.json({ ok: true });
  }

  const email = clampText(payload.email, 160).toLowerCase();
  const name = clampText(payload.name, 120);
  const organization = clampText(payload.organization, 160);
  const interest = clampText(payload.interest, 120);
  const message = clampText(payload.message, 2000);
  const privacyAcknowledged = payload.privacyAcknowledged === "on" || payload.privacyAcknowledged === true;
  const updatesOptIn = payload.updatesOptIn === "on" || payload.updatesOptIn === true;

  const emailRate = await checkPublicRateLimit({
    request,
    scope: "forms-email",
    identifier: email || "blank",
    limit: 4,
    windowSeconds: 60 * 60,
  });

  if (!emailRate.allowed) return rateLimitResponse(emailRate.retryAfter);

  if (!isValidEmail(email) || name.length < 2 || message.length < 4 || !privacyAcknowledged) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const submission = await saveSubmission({
    formType: body.formType,
    name,
    email,
    organization,
    interest,
    message,
    status: "new",
    privacyAcknowledged,
    updatesOptIn,
  });

  void notifyInquiry({ formType: body.formType, name, email, organization, interest, message }).catch(() => null);

  const subscription = updatesOptIn
    ? await requestUpdateSubscription({
        email,
        name,
        source: body.formType === "school" || body.formType === "volunteer" || body.formType === "sponsor" ? body.formType : "contact",
      })
    : null;

  logRouteInfo("public_form_received", {
    route: "/api/forms",
    request_id: request.headers.get("x-vercel-id"),
    form_type: body.formType,
    updates_opt_in: updatesOptIn,
    duration_ms: Date.now() - startedAt,
  });

  return NextResponse.json({
    ok: true,
    submissionId: submission.id,
    subscription: subscription?.confirmationSent ? "confirmation-sent" : updatesOptIn ? "pending" : "not-requested",
  });
}
