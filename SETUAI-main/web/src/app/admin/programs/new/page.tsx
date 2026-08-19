import { AdminShell } from "@/components/admin-shell";
import { ProgramForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function NewProgramPage() {
  await requireAdminPage("/admin/programs");
  return <AdminShell active="programs" title="New Learning Pathway" description="Create a draft pathway. Publish only when the audience, safeguards, and material status are ready to be public."><ProgramForm /></AdminShell>;
}
