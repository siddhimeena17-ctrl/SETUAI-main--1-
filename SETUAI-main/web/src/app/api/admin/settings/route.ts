import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { saveSettings } from "@/lib/cms";

export const runtime = "nodejs";

export async function PUT(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const body = await request.json().catch(() => null);
  const settings = await saveSettings(body || {});
  revalidatePath("/");
  revalidatePath("/admin/site-settings");

  return NextResponse.json({ ok: true, settings });
}
