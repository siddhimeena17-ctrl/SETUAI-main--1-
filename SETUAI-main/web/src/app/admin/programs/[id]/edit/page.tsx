import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { ProgramForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";
import { getProgramEntry } from "@/lib/cms";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditProgramPage({ params }: Props) {
  await requireAdminPage("/admin/programs");
  const { id } = await params;
  const program = await getProgramEntry(id);

  if (!program) notFound();

  return (
    <AdminShell active="programs" title="Edit Program" description={program.title}>
      <ProgramForm program={program} />
    </AdminShell>
  );
}
