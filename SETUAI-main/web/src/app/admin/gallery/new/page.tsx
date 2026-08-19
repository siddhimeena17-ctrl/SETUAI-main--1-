import { AdminShell } from "@/components/admin-shell";
import { GalleryAlbumForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";

export default async function NewAlbumPage() {
  await requireAdminPage("/admin/gallery/new");

  return (
    <AdminShell active="gallery" title="New Album" description="Create a gallery album with image paths or URLs.">
      <GalleryAlbumForm />
    </AdminShell>
  );
}
