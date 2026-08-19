import { AdminShell } from "@/components/admin-shell";
import { SiteContentForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";
import { getSiteContent } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Site Content",
  description: "Edit SetuAI global website content, homepage sections, CTAs, images, and visual settings.",
  path: "/admin/site-content",
});

export default async function SiteContentPage() {
  await requireAdminPage("/admin/site-content");
  const content = await getSiteContent();

  return (
    <AdminShell
      active="site-content"
      title="Site Content"
      description="Edit global text, navigation, footer, homepage sections, images, calls to action, and motion settings."
    >
      <SiteContentForm content={content} />
    </AdminShell>
  );
}
