import { CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { PageHero } from "@/components/page-hero";
import { PageSections } from "@/components/page-sections";
import { getProgram, programs } from "@/content/site";
import { getProgramEntry } from "@/lib/cms";
import { breadcrumbJsonLd, createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return programs.map((program) => ({ slug: program.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const cmsProgram = await getProgramEntry(slug);
  const program = cmsProgram?.status === "published" ? cmsProgram : getProgram(slug);

  if (!program) return {};

  return createMetadata({
    title: program.title,
    description: program.description,
    path: `/programs/${program.slug}`,
    image: program.image,
  });
}

export default async function ProgramPage({ params }: Props) {
  const { slug } = await params;
  const cmsProgram = await getProgramEntry(slug);
  const program = cmsProgram?.status === "published" ? cmsProgram : getProgram(slug);

  if (!program) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Programs", href: "/programs" },
          { name: program.title, href: `/programs/${program.slug}` },
        ])}
      />
      <PageHero page={program} />
      <section className="section-pad bg-white">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
          <aside className="soft-card bg-[var(--color-surface-tint)] p-6">
            <p className="section-kicker">Program snapshot</p>
            <dl className="mt-5 grid gap-5">
              <div>
                <dt className="text-sm font-bold text-[var(--color-muted)]">Audience</dt>
                <dd className="mt-1 text-base font-black text-[var(--color-ink)]">{program.audience}</dd>
              </div>
              <div>
                <dt className="text-sm font-bold text-[var(--color-muted)]">Length</dt>
                <dd className="mt-1 text-base font-black text-[var(--color-ink)]">{program.length}</dd>
              </div>
            </dl>
          </aside>

          <div>
            <h2 className="balance text-3xl font-black leading-tight tracking-[-0.015em] text-[var(--color-ink)]">Learning outcomes</h2>
            <div className="mt-6 grid gap-3">
              {program.outcomes.map((outcome) => (
                <div
                  key={outcome}
                  className="soft-card grid grid-cols-[auto_1fr] gap-3 p-4"
                >
                  <CheckCircle2 aria-hidden="true" className="mt-0.5 text-[var(--color-teal)]" size={20} />
                  <p className="pretty text-sm font-bold leading-6 text-[var(--color-ink-soft)]">{outcome}</p>
                </div>
              ))}
            </div>

            <h2 className="balance mt-10 text-3xl font-black leading-tight tracking-[-0.015em] text-[var(--color-ink)]">Modules</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {program.modules.map((module) => (
                <span
                  key={module}
                  className="rounded-[var(--radius-button)] bg-[var(--color-teal-soft)] px-3 py-2 text-sm font-black text-[var(--color-deep)]"
                >
                  {module}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
      <PageSections sections={program.sections} />
    </>
  );
}
