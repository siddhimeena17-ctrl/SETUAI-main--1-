import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { saveGalleryAlbum } from "@/lib/cms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body?.title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  const album = await saveGalleryAlbum(body);
  revalidatePath("/admin/gallery");

  return NextResponse.json({ ok: true, album });
}
