import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { requireAdminApi } from "@/lib/admin-auth";
import { getSubmission } from "@/lib/cms";
import { notifySubmission } from "@/lib/inquiry-email";
export const runtime = "nodejs";
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const error = await requireAdminApi(request);
  if (error) return error;
  const { id } = await params;
  if (!await getSubmission(id)) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  const result = await notifySubmission(id);
  revalidatePath("/admin/submissions");
  return NextResponse.json({ ok: true, notification: result.status });
}
