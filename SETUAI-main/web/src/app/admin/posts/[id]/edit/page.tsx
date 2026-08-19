import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { PostForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";
import { getPost } from "@/lib/cms";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  await requireAdminPage("/admin/posts");
  const { id } = await params;
  const post = await getPost(id);

  if (!post) notFound();

  return (
    <AdminShell active="posts" title="Edit Update" description={post.title}>
      <PostForm post={post} />
    </AdminShell>
  );
}
