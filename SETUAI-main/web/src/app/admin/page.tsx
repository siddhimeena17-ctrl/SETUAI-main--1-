import Link from "next/link";
import { ArrowRight, BookOpen, FileText, Image, Inbox, Mail, School } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { getDashboardSummary } from "@/lib/cms";
import { requireAdminPage } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Dashboard",
  description: "SetuAI structured admin dashboard for reviewed content, updates, and submissions.",
  path: "/admin",
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export default async function AdminPage() {
  await requireAdminPage("/admin");
  const summary = await getDashboardSummary();
  const stats = [
    { label: "Published updates", value: summary.stats.publishedPosts, icon: FileText },
    { label: "Drafts", value: summary.stats.drafts, icon: BookOpen },
    { label: "Programs", value: summary.stats.programs, icon: School },
    { label: "Albums", value: summary.stats.albums, icon: Image },
    { label: "Unread messages", value: summary.stats.unreadMessages, icon: Inbox },
    { label: "Subscribers", value: summary.stats.subscribers, icon: Mail },
  ];

  return (
    <AdminShell
      active="overview"
      title="Dashboard"
      description="A clear control room for SetuAI content and recent activity."
      actions={
        <Link
          href="/admin/posts/new"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-[#9f0038] px-4 text-sm font-black text-white hover:bg-[#7e002c]"
        >
          New update
        </Link>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-md border border-[#e4d9dc] bg-white p-5">
            <stat.icon aria-hidden="true" className="text-[#9f0038]" size={22} />
            <p className="mt-4 text-3xl font-black text-[#2a1b22]">{stat.value}</p>
            <p className="mt-1 text-sm font-bold text-[#7b6a70]">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
        <section className="rounded-md border border-[#e4d9dc] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-[#2a1b22]">Recent Updates</h2>
            <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm font-black text-[#2a1b22]">
              View all <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {summary.posts.slice(0, 4).map((post) => (
              <div key={post.id} className="flex items-center justify-between gap-4 border-b border-[#efe7e9] pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-black text-[#2a1b22]">{post.title}</p>
                  <p className="mt-1 text-sm text-[#7b6a70]">{formatDate(post.publishedAt)}</p>
                </div>
                <span className={`rounded-md px-3 py-1 text-xs font-black ${post.status === "published" ? "bg-[#dcf7ea] text-[#17724a]" : "bg-[#f7edf1] text-[#9f0038]"}`}>
                  {post.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-md border border-[#e4d9dc] bg-white p-6">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black text-[#2a1b22]">Recent Messages</h2>
            <Link href="/admin/submissions" className="inline-flex items-center gap-2 text-sm font-black text-[#2a1b22]">
              View all <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
          <div className="mt-6 grid gap-4">
            {summary.submissions.length ? (
              summary.submissions.slice(0, 4).map((submission) => (
                <div key={submission.id} className="border-b border-[#efe7e9] pb-4 last:border-0 last:pb-0">
                  <p className="font-black text-[#2a1b22]">{submission.name}</p>
                  <p className="mt-1 text-sm text-[#7b6a70]">{submission.interest || submission.formType}</p>
                </div>
              ))
            ) : (
              <p className="py-12 text-center text-sm font-medium text-[#7b6a70]">No messages yet.</p>
            )}
          </div>
        </section>
      </div>

      <section className="mt-8 rounded-md border border-[#e4d9dc] bg-white p-6">
        <h2 className="text-2xl font-black text-[#2a1b22]">Manage Content</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["Site Content", "/admin/site-content"],
            ["Updates", "/admin/posts"],
            ["Pages", "/admin/pages"],
            ["Programs", "/admin/programs"],
            ["Gallery", "/admin/gallery"],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="rounded-md border border-[#e4d9dc] px-4 py-4 text-sm font-black text-[#2a1b22] hover:bg-[#f7eef1]">
              {label}
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
