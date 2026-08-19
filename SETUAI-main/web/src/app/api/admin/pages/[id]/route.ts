import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { getPage, savePage } from "@/lib/cms";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function PATCH(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const existing = await getPage(id);

  if (!existing) return NextResponse.json({ error: "Page not found" }, { status: 404 });

  const page = await savePage({ ...existing, ...body, id: existing.id });
  revalidatePath("/", "layout");
  revalidatePath(`/${existing.slug}`);
  revalidatePath(`/${page.slug}`);
  revalidatePath("/admin/pages");

  return NextResponse.json({ ok: true, page });
}
