import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { getProgramEntry, saveProgram } from "@/lib/cms";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function PATCH(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const existing = await getProgramEntry(id);

  if (!existing) return NextResponse.json({ error: "Program not found" }, { status: 404 });

  const program = await saveProgram({ ...existing, ...body, id: existing.id });
  revalidatePath("/", "layout");
  revalidatePath("/programs");
  revalidatePath(`/programs/${existing.slug}`);
  revalidatePath(`/programs/${program.slug}`);
  revalidatePath("/admin/programs");

  return NextResponse.json({ ok: true, program });
}
