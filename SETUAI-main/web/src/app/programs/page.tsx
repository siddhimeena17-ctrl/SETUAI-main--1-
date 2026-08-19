import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { getPrograms } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Learning Pathways",
  description: "Reviewed SetuAI learning pathways will appear here only after they have been approved for public publication.",
  path: "/programs",
});

export default async function ProgramsPage() {
  const programList = (await getPrograms()).filter((program) => program.status === "published");

  return (
    <>
      <section className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="section-shell grid gap-8 py-16 lg:grid-cols-[1fr_360px] lg:py-24">
          <div>
            <p className="section-kicker">Learning pathways</p>
            <h1 className="balance mt-5 max-w-4xl text-[clamp(2.8rem,6vw,5.25rem)] font-light leading-none tracking-tight text-[var(--color-ink)]">
              Publish the evidence, not the intention.
            </h1>
            <p className="pretty mt-6 max-w-[60ch] text-lg leading-8 text-[var(--color-muted)]">
              SetuAI will add public learning pathways only after their audience, safeguards, material readiness, delivery context, and status have been reviewed. There is no confirmed public program schedule at this time.
            </p>
          </div>
          <div className="border border-[var(--color-line)] bg-[var(--background)] p-6">
            <h2 className="text-xl font-normal tracking-tight text-[var(--color-ink)]">For schools and education partners</h2>
            <p className="pretty mt-3 text-sm leading-6 text-[var(--color-muted)]">A discovery conversation is the right first step. It is not a booking or program commitment.</p>
            <div className="mt-6"><ButtonLink label="Start a conversation" href="/contact?interest=school" /></div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell">
          {programList.length ? (
            <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {programList.map((program) => (
                <Link key={program.id} href={`/programs/${program.slug}`} className="group grid gap-5 py-7 transition-colors hover:bg-[var(--color-surface)] md:grid-cols-[minmax(0,1fr)_12rem_auto] md:items-end md:px-5">
                  <div className="min-w-0">
                    <p className="section-kicker">{program.eyebrow || "Reviewed pathway"}</p>
                    <h2 className="balance mt-3 text-3xl font-light tracking-tight text-[var(--color-ink)]">{program.title}</h2>
                    <p className="pretty mt-3 max-w-[60ch] text-sm leading-6 text-[var(--color-muted)]">{program.summary}</p>
                  </div>
                  <div className="text-sm leading-6 text-[var(--color-muted)]">
                    {program.audience ? <p>{program.audience}</p> : null}
                    {program.length ? <p>{program.length}</p> : null}
                  </div>
                  <span className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-coral)] group-hover:text-[var(--color-ink)]">
                    Read details <ArrowRight aria-hidden="true" size={16} />
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-[var(--color-line)] bg-[var(--background)] p-8 sm:p-10">
              <p className="section-kicker">Current status</p>
              <h2 className="mt-4 text-3xl font-light tracking-tight text-[var(--color-ink)]">No reviewed pathways are public yet.</h2>
              <p className="pretty mt-4 max-w-[60ch] text-base leading-7 text-[var(--color-muted)]">When a pathway is ready, this page will show its intended audience, format, safeguards, learning aims, publication date, and the difference between a proposal, a pilot, and an active offer.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
