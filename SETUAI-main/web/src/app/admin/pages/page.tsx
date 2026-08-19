import Link from "next/link";
import { PenLine } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { getPages } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Pages",
  description: "Edit SetuAI website page metadata and summaries.",
  path: "/admin/pages",
});

export default async function AdminPagesPage() {
  await requireAdminPage("/admin/pages");
  const pages = await getPages();

  return (
    <AdminShell active="pages" title="Pages" description="Edit the exact public pages visitors read across the site." actions={<Link href="/admin/pages/new" className="rounded-md bg-[#9f0038] px-4 py-3 text-sm font-black text-white hover:bg-[#7e002c]">New page</Link>}>
      <div className="grid gap-4 lg:grid-cols-2">
        {pages.map((page) => (
          <Link key={page.id} href={`/admin/pages/${page.id}/edit`} className="rounded-md border border-[#e4d9dc] bg-white p-5 hover:bg-[#f7eef1]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-black text-[#2a1b22]">{page.title}</p>
                <p className="mt-1 text-sm font-bold text-[#7b6a70]">/{page.slug}</p>
              </div>
              <PenLine aria-hidden="true" size={18} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#7b6a70]">{page.summary}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
