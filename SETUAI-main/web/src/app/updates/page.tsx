import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { UpdatesSignup } from "@/components/updates-signup";
import { getPublishedPosts } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Updates",
  description: "Follow verified SetuAI progress notes, decisions, and future public announcements.",
  path: "/updates",
});

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "long", day: "numeric", year: "numeric" }).format(new Date(value));
}

type Props = { searchParams: Promise<{ subscription?: string }> };

export default async function UpdatesPage({ searchParams }: Props) {
  const updateList = await getPublishedPosts();
  const { subscription } = await searchParams;
  const subscriptionMessage = subscription === "confirmed"
    ? "Your subscription is confirmed."
    : subscription === "unsubscribed"
      ? "You have been unsubscribed from SetuAI updates."
      : subscription === "invalid"
        ? "That subscription link is no longer valid."
        : null;

  return (
    <>
      <section className="border-b border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="section-shell grid gap-8 py-16 lg:grid-cols-[1fr_420px] lg:py-24">
          <div>
            <p className="section-kicker">Updates</p>
            <h1 className="balance mt-5 max-w-4xl text-[clamp(2.8rem,6vw,5.25rem)] font-light leading-none tracking-tight text-[var(--color-ink)]">A public record of what is real, reviewed, and next.</h1>
            <p className="pretty mt-6 max-w-[60ch] text-lg leading-8 text-[var(--color-muted)]">SetuAI will use this page for dated, attributable updates. Progress notes will distinguish decisions, development work, pilots, and verified outcomes.</p>
          </div>
          <UpdatesSignup />
        </div>
      </section>

      {subscriptionMessage ? (
        <div className="section-shell pt-8">
          <p className="border border-[var(--color-line)] bg-[var(--background)] px-4 py-3 text-sm font-medium text-[var(--color-ink)]" role="status">{subscriptionMessage}</p>
        </div>
      ) : null}

      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell">
          {updateList?.length ? (
            <div className="divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]">
              {updateList.map((update) => (
                <Link href={`/updates/${update.slug}`} key={update.id} className="group grid gap-5 py-6 transition-colors hover:bg-[var(--color-surface)] md:grid-cols-[11rem_minmax(0,1fr)_auto] md:items-center md:px-5">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-surface)]">
                    <Image src={update.image || "/images/skypa-hero-classroom.png"} alt={update.imageAlt || update.title} fill sizes="(max-width: 768px) 100vw, 176px" className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium uppercase tracking-[0.12em] text-[var(--color-muted)]"><span>{update.category}</span><span>{formatDate(update.publishedAt)}</span></div>
                    <h2 className="balance mt-3 text-3xl font-light tracking-tight text-[var(--color-ink)]">{update.title}</h2>
                    <p className="pretty mt-3 max-w-[60ch] text-sm leading-6 text-[var(--color-muted)]">{update.summary}</p>
                  </div>
                  <span className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-[var(--color-coral)] group-hover:text-[var(--color-ink)]">Read update <ArrowRight aria-hidden="true" size={16} /></span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-[var(--color-line)] bg-[var(--background)] p-8 sm:p-10">
              <p className="section-kicker">Current status</p>
              <h2 className="mt-4 text-3xl font-light tracking-tight text-[var(--color-ink)]">The first public update has not been published.</h2>
              <p className="pretty mt-4 max-w-[60ch] text-base leading-7 text-[var(--color-muted)]">Subscribe only if you want a notice when SetuAI publishes a verified update. A subscription is separate from an inquiry and can be ended at any time.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
