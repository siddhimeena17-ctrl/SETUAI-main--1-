import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { saveSiteContent } from "@/lib/cms";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const content = await saveSiteContent(body || {});
  revalidatePath("/", "layout");

  for (const path of ["/", "/admin", "/admin/site-content", "/contact", "/programs", "/partners", "/get-involved"]) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, content });
}
