import { ChapterContent } from "@/components/initiative-pages";
import { getSiteContent } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const { initiatives } = await getSiteContent();
  return createMetadata({
    title: initiatives.chapters.title,
    description: initiatives.chapters.overview,
    path: "/chapters",
  });
}
export default async function Page() {
  const { initiatives } = await getSiteContent();
  return <ChapterContent content={initiatives} />;
}
