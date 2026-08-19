import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { PageForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";
import { getPage } from "@/lib/cms";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPagePage({ params }: Props) {
  await requireAdminPage("/admin/pages");
  const { id } = await params;
  const page = await getPage(id);

  if (!page) notFound();

  return (
    <AdminShell active="pages" title="Edit Page" description={page.title}>
      <PageForm page={page} />
    </AdminShell>
  );
}
