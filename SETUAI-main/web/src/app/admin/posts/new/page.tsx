import { AdminShell } from "@/components/admin-shell";
import { PostForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "New Update",
  description: "Create a SetuAI update.",
  path: "/admin/posts/new",
});

export default async function NewPostPage() {
  await requireAdminPage("/admin/posts/new");

  return (
    <AdminShell active="posts" title="New Update" description="Write a clear update for families, schools, partners, and volunteers.">
      <PostForm />
    </AdminShell>
  );
}
