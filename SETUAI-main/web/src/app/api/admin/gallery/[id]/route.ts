import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { deleteGalleryAlbum, getGalleryAlbum, saveGalleryAlbum } from "@/lib/cms";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function PATCH(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const existing = await getGalleryAlbum(id);

  if (!existing) return NextResponse.json({ error: "Album not found" }, { status: 404 });

  const album = await saveGalleryAlbum({ ...existing, ...body, id: existing.id });
  revalidatePath("/admin/gallery");

  return NextResponse.json({ ok: true, album });
}

export async function DELETE(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  await deleteGalleryAlbum(id);
  revalidatePath("/admin/gallery");

  return NextResponse.json({ ok: true });
}
