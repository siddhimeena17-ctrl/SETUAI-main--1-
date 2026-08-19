import { redirect } from "next/navigation";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function SiteSettingsPage() {
  await requireAdminPage("/admin/site-settings");
  redirect("/admin/site-content");
}
