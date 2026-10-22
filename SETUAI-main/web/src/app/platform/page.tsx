import { PlatformContent } from "@/components/initiative-pages";
import { getSiteContent } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const { initiatives } = await getSiteContent();
  return createMetadata({
    title: initiatives.platform.title,
    description: initiatives.platform.overview,
    path: "/platform",
  });
}
export default async function Page() {
  const { initiatives } = await getSiteContent();
  return <PlatformContent content={initiatives} />;
}
