import { TextbookContent, ImpactContent } from "@/components/initiative-pages";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { PageSections } from "@/components/page-sections";
import { getCorePage } from "@/content/site";
import { getPage, getSiteContent } from "@/lib/cms";
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
  if (slug === "textbook" || slug === "impact") {
    const { initiatives } = await getSiteContent();
    return createMetadata({
      title:
        slug === "textbook"
          ? initiatives.textbook.title
          : `${initiatives.impact.value} ${initiatives.impact.label}`,
      description:
        slug === "textbook"
          ? initiatives.textbook.overview
          : initiatives.impact.description,
      path: `/${slug}`,
    });
  }
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
  if (slug === "textbook" || slug === "impact") {
    const [{ initiatives }, storedPage] = await Promise.all([
      getSiteContent(),
      getPage(slug),
    ]);
    // Keep additional editorial sections while replacing the old template’s
    // contradictory publication/impact boilerplate with the initiative model.
    const legacyTitles = new Set([
      "A durable learning resource, built carefully.",
      "Topics under consideration.",
      "Confirmed learning topics.",
      "How we build classroom-ready learning materials.",
      "No impact numbers before there is evidence.",
      "What our reach figure describes.",
      "A future public report should make four things visible.",
    ]);
    const supplementary =
      storedPage?.status === "published"
        ? storedPage.sections.filter(
            (section) => !legacyTitles.has(section.title),
          )
        : [];
    return (
      <>
        {slug === "textbook" ? (
          <TextbookContent content={initiatives} />
        ) : (
          <ImpactContent content={initiatives} />
        )}
        <PageSections sections={supplementary} />
      </>
    );
  }
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
      {page.sections.map((section, index) => (
        <div
          key={index}
          id={
            slug === "about" && section.title.toLowerCase().includes("partners")
              ? "founding-partners"
              : undefined
          }
        >
          <PageSections sections={[section]} />
        </div>
      ))}
    </>
  );
}
