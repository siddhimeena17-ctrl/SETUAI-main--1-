import Link from "next/link";
import { createMetadata } from "@/lib/seo";
import { resources } from "@/content/site";
export const metadata = createMetadata({
  title: "Learning resources",
  description:
    "Explore SetuAI textbook information, review excerpts, and learning opportunities.",
  path: "/resources",
});
export default function ResourcesPage() {
  return (
    <section className="section-pad">
      <div className="section-shell">
        <h1 className="feature-heading">
          Resources for practical AI literacy.
        </h1>
        <p className="pretty mt-6 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
          Explore the textbook, read educational perspectives on it, or bring
          the learning to your community. Approved samples will be linked on the
          textbook page when available.
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            {
              title: "The AI literacy textbook",
              href: "/textbook",
              summary:
                "Learning topics, publication status, and sample inquiries.",
            },
            {
              title: "Recommendations after review",
              href: "/recommendations",
              summary:
                "Readable excerpts and public PDFs from the supplied recommendation letters.",
            },
            {
              title: "Start a chapter",
              href: "/chapters",
              summary:
                "Organize learning sessions with SetuAI materials and chapter support.",
            },
            {
              title: "Explore the platform beta",
              href: "/platform",
              summary:
                "Register beta interest and share your feedback interests.",
            },
            ...resources.map((resource) => ({
              ...resource,
              href: `/resources/${resource.slug}`,
            })),
          ].map((resource) => (
            <article
              key={resource.href}
              className="border-t border-[var(--color-line)] pt-6"
            >
              <h2 className="text-2xl">
                <Link className="subtle-link" href={resource.href}>
                  {resource.title}
                </Link>
              </h2>
              <p className="pretty mt-4 leading-8 text-[var(--color-muted)]">
                {resource.summary}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
