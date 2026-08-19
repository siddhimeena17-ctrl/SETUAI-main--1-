import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { savePost } from "@/lib/cms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const post = await savePost(body);
  revalidatePath("/updates");
  revalidatePath(`/updates/${post.slug}`);
  revalidatePath("/admin/posts");

  return NextResponse.json({ ok: true, post });
}
