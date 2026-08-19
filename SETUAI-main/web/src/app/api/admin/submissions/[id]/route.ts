import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { updateSubmission } from "@/lib/cms";

type Context = {
  params: Promise<{ id: string }>;
};

export const runtime = "nodejs";

export async function PATCH(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const body = await request.json().catch(() => ({})) as { status?: string; assignedTo?: string; notes?: string; read?: boolean };
  const status = body.status === "in-progress" || body.status === "closed" || body.status === "new" ? body.status : undefined;
  const submission = await updateSubmission(id, {
    status,
    read: body.read ?? true,
    assignedTo: typeof body.assignedTo === "string" ? body.assignedTo.slice(0, 120) : undefined,
    notes: typeof body.notes === "string" ? body.notes.slice(0, 2000) : undefined,
  });
  if (!submission) return NextResponse.json({ error: "Submission not found" }, { status: 404 });
  revalidatePath("/admin/submissions");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true, submission });
}
