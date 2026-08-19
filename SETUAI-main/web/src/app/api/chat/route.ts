import { createGateway } from "@ai-sdk/gateway";
import { generateText } from "ai";
import { NextResponse } from "next/server";
import { chatbotKnowledge, siteConfig } from "@/content/site";
import { checkPublicRateLimit, clampText, getClientIp, hashIdentifier, rateLimitResponse } from "@/lib/security";
import { logRouteError, logRouteInfo } from "@/lib/observability";

type IncomingMessage = {
  role: "user" | "assistant";
  content: string;
};

const defaultModel = "amazon/nova-micro";
const maxMessageLength = 900;
const maxOutputTokens = 280;
const requestTimeoutMs = 12_000;

function gatewayFailureReason(error: unknown) {
  const candidate = error as { statusCode?: unknown; status?: unknown; message?: unknown } | null;
  const statusCode = typeof candidate?.statusCode === "number" ? candidate.statusCode : typeof candidate?.status === "number" ? candidate.status : undefined;
  const message = String(candidate?.message || "").toLowerCase();

  if (statusCode === 403 && message.includes("credit card")) return "gateway_activation_required";
  if (statusCode === 401 || statusCode === 403) return "gateway_authentication_failed";
  if (statusCode === 429) return "gateway_rate_limited";
  return "gateway_request_failed";
}

function unavailableReply(locale: "en" | "hi", reason: string) {
  if (reason === "gateway_activation_required") {
    return locale === "hi"
      ? "SetuAI assistant तैयार है, लेकिन AI सेवा अभी सक्रिय की जा रही है। अभी के लिए कृपया संपर्क फ़ॉर्म इस्तेमाल करें।"
      : "The SetuAI assistant is ready, but its AI service is still being activated. Please use the contact form for now.";
  }

  if (reason === "gateway_rate_limited") {
    return locale === "hi"
      ? "SetuAI assistant अभी व्यस्त है। कृपया कुछ मिनट बाद फिर कोशिश करें या संपर्क फ़ॉर्म इस्तेमाल करें।"
      : "The SetuAI assistant is busy right now. Please try again in a few minutes or use the contact form.";
  }

  return locale === "hi"
    ? "मैं अभी AI Gateway तक नहीं पहुंच पा रहा हूं। कृपया संपर्क फ़ॉर्म इस्तेमाल करें और SetuAI टीम जवाब देगी।"
    : "I could not reach the AI Gateway right now. Please use the contact form and the SetuAI team can follow up.";
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const rate = await checkPublicRateLimit({
    request,
    scope: "chat",
    limit: 12,
    windowSeconds: 10 * 60,
  });

  if (!rate.allowed) return rateLimitResponse(rate.retryAfter);

  const body = (await request.json().catch(() => null)) as { messages?: IncomingMessage[]; locale?: string } | null;
  const locale = body?.locale === "hi" ? "hi" : "en";
  const messages =
    body?.messages
      ?.filter((message) => (message.role === "user" || message.role === "assistant") && message.content?.trim())
      .map((message) => ({
        role: message.role,
        content: clampText(message.content, maxMessageLength),
      }))
      .slice(-6) || [];

  if (!messages.length) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  if (messages.some((message) => message.content.length > maxMessageLength)) {
    return NextResponse.json({ error: "Message is too long" }, { status: 400 });
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_AI_GATEWAY_API_KEY;

  if (!apiKey) {
    logRouteInfo("chat_unavailable", { route: "/api/chat", request_id: request.headers.get("x-vercel-id"), reason: "gateway_not_configured", duration_ms: Date.now() - startedAt });
    return NextResponse.json({
      reply:
        locale === "hi"
          ? "SetuAI assistant लगा हुआ है, लेकिन सर्वर पर Vercel AI Gateway key अभी configure नहीं है। अभी के लिए संपर्क फॉर्म इस्तेमाल करें।"
          : "The SetuAI assistant is installed, but the Vercel AI Gateway key is not configured on the server yet. Please use the contact form for now.",
    });
  }

  try {
    const model = process.env.AI_GATEWAY_MODEL || defaultModel;
    const aiGateway = createGateway({ apiKey });
    const result = await generateText({
      model: aiGateway(model),
      system: [
        `You are the website assistant for ${siteConfig.name}.`,
        locale === "hi"
          ? "Reply in simple, friendly Hindi. Keep proper nouns such as SetuAI.org, Summit Intelligent Systems, Shikivaa Foundation, and SKYPA Foundation unchanged."
          : "Reply in simple, friendly English.",
        "Be concise, warm, and practical. Help visitors find the right page or form.",
        "Use only approved facts below. If a detail is not provided, say that SetuAI can follow up through the contact form.",
        "Do not invent confirmed schools, company partners, tax status details, dollar amounts, or impact results.",
        "Approved facts:",
        ...chatbotKnowledge.map((fact) => `- ${fact}`),
      ].join("\n"),
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      maxOutputTokens,
      temperature: 0.3,
      timeout: requestTimeoutMs,
      providerOptions: {
        gateway: {
          tags: ["feature:setuai-chat"],
          user: hashIdentifier(getClientIp(request)).slice(0, 32),
        },
      },
    });

    logRouteInfo("chat_completed", {
      route: "/api/chat",
      request_id: request.headers.get("x-vercel-id"),
      model,
      input_tokens: result.usage.inputTokens,
      output_tokens: result.usage.outputTokens,
      duration_ms: Date.now() - startedAt,
    });

    return NextResponse.json({ reply: result.text, model });
  } catch (error) {
    const reason = gatewayFailureReason(error);
    logRouteError("chat_failed", {
      route: "/api/chat",
      request_id: request.headers.get("x-vercel-id"),
      reason,
      duration_ms: Date.now() - startedAt,
    });
    return NextResponse.json(
      {
        reply: unavailableReply(locale, reason),
      },
      { status: 200 },
    );
  }
}
