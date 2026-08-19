import { NextResponse } from "next/server";
import { checkPublicRateLimit, clampText, rateLimitResponse } from "@/lib/security";
import { isValidEmail, normalizeEmail, requestUpdateSubscription } from "@/lib/subscribers";
import { logRouteInfo } from "@/lib/observability";

type SubscribePayload = {
  email?: string;
  name?: string;
  privacyAcknowledged?: boolean | string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const startedAt = Date.now();
  const rate = await checkPublicRateLimit({
    request,
    scope: "updates-subscribe",
    limit: 6,
    windowSeconds: 15 * 60,
  });

  if (!rate.allowed) return rateLimitResponse(rate.retryAfter);

  const body = (await request.json().catch(() => null)) as SubscribePayload | null;
  const email = normalizeEmail(clampText(body?.email, 160));
  const name = clampText(body?.name, 120);
  const privacyAcknowledged = body?.privacyAcknowledged === true || body?.privacyAcknowledged === "on";

  if (!isValidEmail(email) || !privacyAcknowledged) {
    return NextResponse.json({ error: "A valid email and privacy acknowledgement are required" }, { status: 400 });
  }

  const result = await requestUpdateSubscription({ email, name, source: "updates-page" });

  if (!result.stored) {
    return NextResponse.json({ error: "Unable to start the subscription" }, { status: 400 });
  }

  logRouteInfo("updates_subscription_requested", {
    route: "/api/updates/subscribe",
    request_id: request.headers.get("x-vercel-id"),
    confirmation_sent: Boolean(result.confirmationSent),
    already_confirmed: Boolean(result.alreadyConfirmed),
    duration_ms: Date.now() - startedAt,
  });

  return NextResponse.json({
    ok: true,
    confirmed: Boolean(result.alreadyConfirmed),
    confirmationSent: Boolean(result.confirmationSent),
  });
}
