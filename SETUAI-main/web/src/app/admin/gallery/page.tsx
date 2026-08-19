import Link from "next/link";
import { PenLine } from "lucide-react";
import { AdminMutationButton } from "@/components/admin-actions";
import { AdminShell } from "@/components/admin-shell";
import { requireAdminPage } from "@/lib/admin-auth";
import { getGalleryAlbums } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Admin Gallery",
  description: "Manage SetuAI photo albums.",
  path: "/admin/gallery",
});

export default async function AdminGalleryPage() {
  await requireAdminPage("/admin/gallery");
  const albums = await getGalleryAlbums();

  return (
    <AdminShell active="gallery" title="Gallery" description="Manage approved images and albums with accurate alternative text and permissions." actions={<Link href="/admin/gallery/new" className="rounded-md bg-[#9f0038] px-4 py-3 text-sm font-black text-white hover:bg-[#7e002c]">New album</Link>}>
      {albums.length ? (
        <div className="grid gap-4 lg:grid-cols-3">
          {albums.map((album) => (
            <div key={album.id} className="rounded-md border border-[#e4d9dc] bg-white p-5">
              <p className="text-xl font-black text-[#2a1b22]">{album.title}</p>
              <p className="mt-2 text-sm leading-6 text-[#7b6a70]">{album.description || "No description yet."}</p>
              <p className="mt-4 text-sm font-bold text-[#7b6a70]">{album.images.length} images</p>
              <div className="mt-5 flex gap-2">
                <Link href={`/admin/gallery/${album.id}/edit`} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-[#e4d9dc] px-3 text-sm font-black hover:bg-[#f7eef1]"><PenLine size={15} /> Edit</Link>
                <AdminMutationButton label="Delete" endpoint={`/api/admin/gallery/${album.id}`} method="DELETE" destructive />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-[#e4d9dc] bg-white px-5 py-20 text-center">
          <p className="text-sm font-medium text-[#7b6a70]">No albums yet.</p>
          <Link href="/admin/gallery/new" className="mt-5 inline-flex rounded-md bg-[#9f0038] px-4 py-3 text-sm font-black text-white hover:bg-[#7e002c]">Create first album</Link>
        </div>
      )}
    </AdminShell>
  );
}
