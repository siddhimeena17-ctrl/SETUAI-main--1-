import { NextResponse } from "next/server";
import { getPost, getPosts } from "@/lib/cms";
import { sendPublishedUpdateEmail } from "@/lib/update-email";

type SendPayload = {
  secret?: string;
  slug?: string;
  id?: string;
  dryRun?: boolean;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as SendPayload;
  const configuredSecret = process.env.UPDATES_WEBHOOK_SECRET;
  const providedSecret = request.headers.get("x-updates-secret") || body.secret;

  if (!configuredSecret) return NextResponse.json({ error: "Update email webhook is not configured" }, { status: 503 });
  if (providedSecret !== configuredSecret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const post = body.id || body.slug
    ? await getPost(body.id || body.slug || "")
    : (await getPosts()).find((entry) => entry.status === "published" && entry.notificationStatus !== "sent");
  if (!post || post.status !== "published") return NextResponse.json({ error: "Published update not found" }, { status: 404 });

  if (body.dryRun) {
    return NextResponse.json({ ok: true, dryRun: true, update: { id: post.id, slug: post.slug, title: post.title } });
  }

  const result = await sendPublishedUpdateEmail(post);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
