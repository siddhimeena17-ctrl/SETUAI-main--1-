import { JsonLd } from "@/components/json-ld";
import { publishedRecommendations } from "@/content/initiatives";
import { absoluteUrl } from "@/lib/utils";
import { InitiativeHero } from "@/components/initiative-pages";
import { Recommendations } from "@/components/recommendations";
import { getSiteContent } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";
export async function generateMetadata() {
  const { initiatives } = await getSiteContent();
  return createMetadata({
    title: "Textbook recommendations",
    description: initiatives.recommendationContext,
    path: "/recommendations",
  });
}
export default async function Page() {
  const { initiatives } = await getSiteContent();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: initiatives.recommendationTitle,
          itemListElement: publishedRecommendations(initiatives).map(
            (item, index) => ({
              "@type": "ListItem",
              position: index + 1,
              item: {
                "@type": "Quotation",
                text: item.excerpt,
                creator: {
                  "@type": "Person",
                  name: item.signatory,
                  affiliation: {
                    "@type": "Organization",
                    name: item.organization,
                    url: item.website,
                  },
                },
                about: { "@type": "Book", name: initiatives.textbook.title },
                url: absoluteUrl(`/recommendations#${item.id}`),
              },
            }),
          ),
        }}
      />
      <InitiativeHero
        title={initiatives.recommendationTitle}
        body={initiatives.recommendationContext}
        status="The textbook, in educators’ words"
      />
      <section className="section-pad">
        <div className="section-shell">
          <Recommendations content={initiatives} />
          <p className="pretty mt-12 max-w-3xl text-sm leading-7 text-[var(--color-muted)]">
            The public PDFs reproduce the selected passages with attribution and
            context. Original letters are retained privately by SetuAI; personal
            contact details and signatures are excluded from these public
            excerpts. Organization links lead to their own websites.
          </p>
        </div>
      </section>
    </>
  );
}
