import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { getSiteContent } from "@/lib/cms";
import { submitToFormspree, FormspreeError } from "@/lib/formspree";
import { logRouteError } from "@/lib/observability";
import { fieldsFor, formTypes, type FormType } from "@/content/form-fields";
import { checkPublicRateLimit, rateLimitResponse } from "@/lib/security";
import { isValidEmail, requestUpdateSubscription } from "@/lib/subscribers";

export const runtime = "nodejs";
export const maxDuration = 60;
function clean(value: unknown) {
  return typeof value === "string"
    ? value
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
        .trim()
    : "";
}
export async function POST(request: Request) {
  try {
    const rate = await checkPublicRateLimit({
      request,
      scope: "forms-ip",
      limit: 8,
      windowSeconds: 900,
      storage: "memory",
    });
    if (!rate.allowed) return rateLimitResponse(rate.retryAfter);
    if (!request.headers.get("content-type")?.includes("application/json"))
      return NextResponse.json(
        { error: "Use a JSON request." },
        { status: 415 },
      );
    const raw = await request.text();
    if (raw.length > 20000)
      return NextResponse.json(
        { error: "Submission is too large." },
        { status: 413 },
      );
    let body;
    try {
      body = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        { error: "Invalid submission." },
        { status: 400 },
      );
    }
    const type = body?.formType as FormType;
    const payload = body?.payload;
    if (
      !formTypes.includes(type) ||
      !payload ||
      typeof payload !== "object" ||
      Array.isArray(payload)
    )
      return NextResponse.json(
        { error: "Invalid submission." },
        { status: 400 },
      );
    if (clean(payload.companyWebsite || payload.website))
      return NextResponse.json({ ok: true });
    const values: Record<string, string> = {};
    for (const field of fieldsFor(type)) {
      const cleaned = clean(payload[field.name]);
      const value =
        field.kind === "textarea" ? cleaned : cleaned.replace(/\s+/g, " ");
      if (
        (field.required && !value) ||
        value.length > (field.max || 250) ||
        (value && field.options && !field.options.includes(value)) ||
        (value &&
          field.kind === "number" &&
          (!/^\d{1,6}$/.test(value) || Number(value) < 1))
      )
        return NextResponse.json(
          { error: `Please check: ${field.label}.` },
          { status: 400 },
        );
      values[field.name] = value;
    }
    values.email = values.email.toLowerCase();
    const privacyAcknowledged =
      payload.privacyAcknowledged === "on" ||
      payload.privacyAcknowledged === true;
    const updatesOptIn =
      !["chapter", "beta"].includes(type) &&
      (payload.updatesOptIn === "on" || payload.updatesOptIn === true);
    if (
      !isValidEmail(values.email) ||
      values.name.length < 2 ||
      !privacyAcknowledged
    )
      return NextResponse.json(
        {
          error:
            "Please provide your name, a valid email, and the privacy acknowledgment.",
        },
        { status: 400 },
      );
    const emailRate = await checkPublicRateLimit({
      request,
      scope: "forms-email",
      identifier: values.email,
      limit: 4,
      windowSeconds: 3600,
      storage: "memory",
    });
    if (!emailRate.allowed) return rateLimitResponse(emailRate.retryAfter);
    if (type === "chapter" || type === "beta") {
      const { initiatives } = await getSiteContent();
      if (
        type === "chapter"
          ? !initiatives.chapters.applicationsOpen
          : !initiatives.platform.betaOpen
      )
        return NextResponse.json(
          {
            error:
              "This application form is currently paused. Please contact SetuAI.",
          },
          { status: 409 },
        );
    }
    const sourcePage =
      typeof body.sourcePage === "string" &&
      /^\/[a-z0-9/-]*$/i.test(body.sourcePage)
        ? body.sourcePage.slice(0, 200)
        : "/contact";
    // Include a stable reference in the provider record for retry handling.
    // Never make delivery depend on the unavailable Redis submissions store.
    const fingerprint = createHash("sha256")
      .update(JSON.stringify({ type, values, updatesOptIn }))
      .digest("hex");
    const extras = Object.fromEntries(
      Object.entries(values).filter(
        ([key]) =>
          !["name", "email", "organization", "interest", "message"].includes(
            key,
          ),
      ),
    );
    const { submissionId, duplicate } = await submitToFormspree(
      {
        formType: type,
        name: values.name,
        email: values.email,
        organization: values.organization || "",
        interest:
          values.interest || values.participation || values.setting || "",
        message: values.message || "",
        sourcePage,
        fields: extras,
        status: "new",
        privacyAcknowledged,
        updatesOptIn,
        notificationStatus: "pending",
      },
      fingerprint,
    );
    let subscription = "not-requested";
    if (updatesOptIn && !duplicate) {
      try {
        const result = await requestUpdateSubscription({
          email: values.email,
          name: values.name,
          source: ["school", "volunteer", "sponsor"].includes(type)
            ? (type as "school" | "volunteer" | "sponsor")
            : "contact",
        });
        subscription = result.confirmationSent
          ? "confirmation-sent"
          : "pending";
      } catch {
        subscription = "pending";
      }
    }
    return NextResponse.json({
      ok: true,
      submissionId,
      duplicate,
      notification: "managed",
      subscription,
    });
  } catch (error) {
    logRouteError("inquiry_submission_failed", {
      route: "/api/forms",
      provider: "formspree",
      status: error instanceof FormspreeError ? error.status : 503,
    });
    if (error instanceof FormspreeError && error.status === 429) {
      return NextResponse.json(
        {
          error:
            "The inquiry service is temporarily at capacity. Please wait before trying again, or email setuai.edu@gmail.com.",
        },
        { status: 429, headers: { "Retry-After": "60" } },
      );
    }
    return NextResponse.json(
      {
        error:
          "We could not confirm your request. Please try again later or email setuai.edu@gmail.com.",
      },
      { status: 503 },
    );
  }
}
