import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { mergeInitiatives, validateInitiatives } from "@/lib/initiative-content";
import { saveSiteContent } from "@/lib/cms";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Invalid content" }, { status: 400 });
  const errors = body.initiatives ? validateInitiatives(mergeInitiatives(body.initiatives)) : [];
  if (errors.length) return NextResponse.json({ error: errors.join(" ") }, { status: 400 });
  const content = await saveSiteContent(body);
  revalidatePath("/", "layout");

  for (const path of ["/", "/admin", "/admin/site-content", "/contact", "/programs", "/partners", "/get-involved", "/textbook", "/recommendations", "/chapters", "/platform", "/impact", "/sitemap.xml"]) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, content });
}
