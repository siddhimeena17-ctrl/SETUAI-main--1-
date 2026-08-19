import { notFound } from "next/navigation";
import { AdminShell } from "@/components/admin-shell";
import { GalleryAlbumForm } from "@/components/admin-forms";
import { requireAdminPage } from "@/lib/admin-auth";
import { getGalleryAlbum } from "@/lib/cms";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditAlbumPage({ params }: Props) {
  await requireAdminPage("/admin/gallery");
  const { id } = await params;
  const album = await getGalleryAlbum(id);

  if (!album) notFound();

  return (
    <AdminShell active="gallery" title="Edit Album" description={album.title}>
      <GalleryAlbumForm album={album} />
    </AdminShell>
  );
}
