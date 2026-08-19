import { AdminShell } from "@/components/admin-shell";
import { PageForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function NewPagePage() {
  await requireAdminPage("/admin/pages");
  return <AdminShell active="pages" title="New Page" description="Create a draft page, preview it as you edit, and publish only after the content is verified."><PageForm /></AdminShell>;
}
