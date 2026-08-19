import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { savePage } from "@/lib/cms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || typeof body.slug !== "string") {
    return NextResponse.json({ error: "A page title and URL slug are required." }, { status: 400 });
  }

  const page = await savePage({ ...body, status: body.status === "published" ? "published" : "draft" });
  revalidatePath("/", "layout");
  revalidatePath(`/${page.slug}`);
  revalidatePath("/admin/pages");
  return NextResponse.json({ ok: true, page }, { status: 201 });
}
