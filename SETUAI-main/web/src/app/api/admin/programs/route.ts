import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { saveProgram } from "@/lib/cms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || typeof body.slug !== "string") {
    return NextResponse.json({ error: "A program title and URL slug are required." }, { status: 400 });
  }

  const program = await saveProgram({ ...body, status: body.status === "published" ? "published" : "draft" });
  revalidatePath("/programs");
  revalidatePath(`/programs/${program.slug}`);
  revalidatePath("/admin/programs");
  return NextResponse.json({ ok: true, program }, { status: 201 });
}
