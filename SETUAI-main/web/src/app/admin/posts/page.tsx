import Link from "next/link";
import { ExternalLink, PenLine } from "lucide-react";
import { AdminMutationButton } from "@/components/admin-actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { getPosts } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Updates",
  description: "Create and manage SetuAI updates.",
  path: "/admin/posts",
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function AdminPostsPage() {
  await requireAdminPage("/admin/posts");
  const posts = await getPosts();

  return (
    <AdminShell
      active="posts"
      title="Updates"
      description="Create and manage news, announcements, textbook milestones, and events."
      actions={<Link href="/admin/posts/new" className="rounded-md bg-[#9f0038] px-4 py-3 text-sm font-black text-white hover:bg-[#7e002c]">New update</Link>}
    >
      <div className="overflow-hidden rounded-md border border-[#e4d9dc] bg-white">
        <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_1fr] gap-4 border-b border-[#e4d9dc] px-4 py-4 text-xs font-black uppercase tracking-[0.12em] text-[#7b6a70]">
          <span>Title</span>
          <span>Category</span>
          <span>Status</span>
          <span>Date</span>
          <span className="text-right">Actions</span>
        </div>
        {posts.map((post) => (
          <div key={post.id} className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.8fr_1fr] items-center gap-4 border-b border-[#efe7e9] px-4 py-5 last:border-0">
            <div>
              <p className="font-black text-[#2a1b22]">{post.title}</p>
              <p className="mt-1 text-sm text-[#7b6a70]">/{post.slug}</p>
            </div>
            <span className="text-sm font-bold text-[#7b6a70]">{post.category}</span>
            <span className={`w-fit rounded-md px-3 py-1 text-xs font-black ${post.status === "published" ? "bg-[#dcf7ea] text-[#17724a]" : "bg-[#f7edf1] text-[#9f0038]"}`}>{post.status}</span>
            <span className="text-sm font-bold text-[#7b6a70]">{formatDate(post.publishedAt)}</span>
            <div className="flex justify-end gap-2">
              <Link href={`/updates/${post.slug}`} className="grid h-10 w-10 place-items-center rounded-md border border-[#e4d9dc] hover:bg-[#f7eef1]" aria-label="View update"><ExternalLink size={16} /></Link>
              <Link href={`/admin/posts/${post.id}/edit`} className="grid h-10 w-10 place-items-center rounded-md border border-[#e4d9dc] hover:bg-[#f7eef1]" aria-label="Edit update"><PenLine size={16} /></Link>
              <AdminMutationButton label={post.status === "published" ? "Unpublish" : "Publish"} endpoint={`/api/admin/posts/${post.id}`} body={{ status: post.status === "published" ? "draft" : "published" }} />
              {post.status === "published" && post.notificationStatus !== "sent" ? <AdminMutationButton label="Send update" method="POST" endpoint={`/api/admin/posts/${post.id}/send`} /> : null}
              <AdminMutationButton label="Delete" endpoint={`/api/admin/posts/${post.id}`} method="DELETE" destructive />
            </div>
          </div>
        ))}
      </div>
    </AdminShell>
  );
}
