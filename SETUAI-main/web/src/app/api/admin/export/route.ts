import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-auth";
import { getGalleryAlbums, getPages, getPosts, getPrograms, getSettings, getSiteContent, getSubscribers, getSubmissions } from "@/lib/cms";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const authError = await requireAdminApi(request);
  if (authError) return authError;

  const [siteContent, settings, pages, programs, posts, gallery, submissions, subscribers] = await Promise.all([
    getSiteContent(),
    getSettings(),
    getPages(),
    getPrograms(),
    getPosts(),
    getGalleryAlbums(),
    getSubmissions(),
    getSubscribers(),
  ]);
  const body = JSON.stringify({ exportedAt: new Date().toISOString(), siteContent, settings, pages, programs, posts, gallery, submissions, subscribers }, null, 2);

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="setuai-admin-export-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
