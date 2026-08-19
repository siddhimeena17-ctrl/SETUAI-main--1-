import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { getPost } from "@/lib/cms";
import { sendPublishedUpdateEmail } from "@/lib/update-email";

type Context = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function POST(request: Request, context: Context) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const { id } = await context.params;
  const post = await getPost(id);
  if (!post || post.status !== "published") {
    return NextResponse.json({ error: "Publish the update before sending it to confirmed subscribers." }, { status: 400 });
  }

  const result = await sendPublishedUpdateEmail(post);
  if (!result.ok) return NextResponse.json(result, { status: 500 });

  revalidatePath("/admin/posts");
  return NextResponse.json(result);
}
