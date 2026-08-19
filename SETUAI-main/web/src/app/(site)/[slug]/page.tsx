import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { PageSections } from "@/components/page-sections";
import { getCorePage } from "@/content/site";
import { getPage } from "@/lib/cms";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { corePages } = await import("@/content/site");
  return corePages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cmsPage = await getPage(slug);
  const page = cmsPage?.status === "published" ? cmsPage : getCorePage(slug);

  if (!page) return {};

  return createMetadata({
    title: page.title,
    description: page.description,
    path: `/${page.slug}`,
    image: page.image,
  });
}

export default async function CorePage({ params }: Props) {
  const { slug } = await params;
  const cmsPage = await getPage(slug);
  const page = cmsPage?.status === "published" ? cmsPage : getCorePage(slug);

  if (!page) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: page.title, href: `/${page.slug}` },
        ])}
      />
      <PageHero page={page} />
      <PageSections sections={page.sections} />
    </>
  );
}
