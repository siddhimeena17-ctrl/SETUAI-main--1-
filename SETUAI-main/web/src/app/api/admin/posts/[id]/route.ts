import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { deletePost, getPost, savePost } from "@/lib/cms";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function PATCH(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const existing = await getPost(id);

  if (!existing) return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const post = await savePost({ ...existing, ...body, id: existing.id });
  revalidatePath("/updates");
  revalidatePath(`/updates/${existing.slug}`);
  revalidatePath(`/updates/${post.slug}`);
  revalidatePath("/admin/posts");

  return NextResponse.json({ ok: true, post });
}

export async function DELETE(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  await deletePost(id);
  revalidatePath("/updates");
  revalidatePath("/admin/posts");

  return NextResponse.json({ ok: true });
}
