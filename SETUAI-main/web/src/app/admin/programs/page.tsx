import Link from "next/link";
import { PenLine } from "lucide-react";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { getPrograms } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Programs",
  description: "Edit SetuAI program content.",
  path: "/admin/programs",
});

export default async function AdminProgramsPage() {
  await requireAdminPage("/admin/programs");
  const programs = await getPrograms();

  return (
    <AdminShell active="programs" title="Learning Pathways" description="Keep public pathway pages accurate, reviewable, and clear about their status." actions={<Link href="/admin/programs/new" className="rounded-md bg-[#9f0038] px-4 py-3 text-sm font-black text-white hover:bg-[#7e002c]">New pathway</Link>}>
      <div className="grid gap-4 lg:grid-cols-2">
        {programs.map((program) => (
          <Link key={program.id} href={`/admin/programs/${program.id}/edit`} className="rounded-md border border-[#e4d9dc] bg-white p-5 hover:bg-[#f7eef1]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xl font-black text-[#2a1b22]">{program.title}</p>
                <p className="mt-1 text-sm font-bold text-[#7b6a70]">{program.audience}</p>
              </div>
              <PenLine aria-hidden="true" size={18} />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#7b6a70]">{program.summary}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
