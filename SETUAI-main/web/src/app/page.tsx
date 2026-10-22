import { InteractiveMap } from "@/components/interactive-map";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { Recommendations } from "@/components/recommendations";
import { PartnerDirectory } from "@/components/partner-directory";
import { getSiteContent, getPosts } from "@/lib/cms";
import { createMetadata } from "@/lib/seo";
import { safeContentUrl } from "@/lib/initiative-content";

export async function generateMetadata() {
  const { seo } = await getSiteContent();
  return createMetadata({
    title: seo.homeTitle,
    description: seo.homeDescription,
    path: "/",
    image: seo.homeImage,
  });
}
export default async function HomePage() {
  const [content, posts] = await Promise.all([getSiteContent(), getPosts()]);
  const { home, initiatives: work } = content;
  const sections: Record<string, React.ReactNode> = {
    impact: (
      <section className="border-b border-[var(--color-line)] py-10">
        <div className="section-shell grid gap-6 md:grid-cols-2 md:items-center">
          <h2 className="text-3xl font-normal tracking-tight sm:text-4xl">
            {work.impact.value} {work.impact.label}
          </h2>
          <div>
            <p className="leading-7 text-[var(--color-muted)]">
              {work.impact.description}
            </p>
            <Link
              className="subtle-link mt-3 inline-block text-sm"
              href="/impact"
            >
              How we measure our reach →
            </Link>
            {work.impact.reportingDate ? (
              <p className="mt-2 text-sm">
                Reported {work.impact.reportingDate}
              </p>
            ) : null}
          </div>
        </div>
      </section>
    ),
    textbook: (
      <section className="section-pad" id="textbook">
        <div className="section-shell grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <p className="mb-5 font-medium text-[var(--color-coral-deep)]">
              {work.textbook.status}
            </p>
            <h2 className="feature-heading">{home.textbook.title}</h2>
            <p className="pretty mt-6 max-w-prose text-lg leading-8 text-[var(--color-muted)]">
              {home.textbook.body}
            </p>
            <p className="mt-5 leading-7">{work.textbook.audience}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink label="Explore the Textbook" href="/textbook" />
              <ButtonLink
                label="Request a sample"
                href="/textbook#inquiry"
                variant="secondary"
              />
            </div>
          </div>
          {work.textbook.image && safeContentUrl(work.textbook.image) ? (
            <Image
              src={work.textbook.image}
              alt={work.textbook.imageAlt}
              width={600}
              height={700}
              className="w-full object-contain"
              unoptimized
            />
          ) : (
            <div className="bg-[var(--color-deep)] p-8 text-stone-50 sm:p-10">
              <h3 className="text-2xl">Understand. Build. Question.</h3>
              <ul className="mt-6 divide-y divide-stone-50/20">
                {work.textbook.topics.map((topic) => (
                  <li className="py-4 leading-7" key={topic}>
                    {topic}
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm leading-6 text-stone-50/75">
                A field guide for practical learning, with judgment at its
                center.
              </p>
            </div>
          )}
        </div>
      </section>
    ),
    recommendations: (
      <section className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell">
          <h2 className="feature-heading max-w-3xl">
            {work.recommendationTitle}
          </h2>
          <p className="pretty mt-6 max-w-3xl leading-7 text-[var(--color-muted)]">
            {work.recommendationContext}
          </p>
          <Recommendations content={work} featured />
          <Link
            className="subtle-link mt-8 inline-block font-medium"
            href="/recommendations"
          >
            Read all recommendations and letter excerpts →
          </Link>
        </div>
      </section>
    ),
    chapters: (
      <section className="section-pad bg-[var(--color-coral)] text-[var(--color-ink)]">
        <div className="section-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="feature-heading">{work.chapters.title}</h2>
            <p className="pretty mt-6 max-w-prose text-lg leading-8">
              {work.chapters.overview}
            </p>
            <div className="mt-8">
              <ButtonLink
                label={
                  work.chapters.applicationsOpen
                    ? "Apply to start a chapter"
                    : "Explore chapters"
                }
                href="/chapters"
              />
            </div>
          </div>
          <ul className="self-center divide-y divide-black/25">
            {work.chapters.support.map((item) => (
              <li key={item} className="py-5 text-lg leading-8">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    ),
    platform: (
      <section className="section-pad bg-[var(--color-deep)] text-stone-50">
        <div className="section-shell grid gap-10 lg:grid-cols-2">
          <div>
            <p className="mb-5 text-stone-50/80">
              {work.platform.betaOpen ? "Beta testing is open" : "Platform"}
            </p>
            <h2 className="feature-heading">{work.platform.title}</h2>
          </div>
          <div>
            <p className="pretty text-xl leading-9">{work.platform.overview}</p>
            <p className="pretty mt-5 leading-8 text-stone-50/80">
              {work.platform.collaboration}
            </p>
            <div className="mt-8">
              <ButtonLink
                label={
                  work.platform.betaOpen
                    ? "Join the Platform Beta"
                    : "Explore the platform"
                }
                href="/platform"
                variant="light"
              />
            </div>
          </div>
        </div>
      </section>
    ),
    mission: (
      <>
        <section className="section-pad">
          <div className="section-shell grid gap-10 lg:grid-cols-2">
            <h2 className="feature-heading">{home.intro.title}</h2>
            <div>
              <p className="text-xl leading-9">
                {home.intro.featuredStatement}
              </p>
              {home.intro.body.map((paragraph) => (
                <p
                  className="pretty mt-5 max-w-prose leading-8 text-[var(--color-muted)]"
                  key={paragraph}
                >
                  {paragraph}
                </p>
              ))}
              <Link href="/about" className="subtle-link mt-6 inline-block">
                Our mission and team →
              </Link>
              <div className="mt-10">
                <h3 className="text-2xl">{home.heartbeat.title}</h3>
                <p className="pretty mt-4 leading-8 text-[var(--color-muted)]">
                  {home.heartbeat.body}
                </p>
                <ul className="mt-4 grid gap-3">
                  {home.heartbeat.pulses.map((pulse) => (
                    <li key={pulse}>{pulse}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
        <InteractiveMap />
      </>
    ),
    programs: (
      <section className="section-pad border-y border-[var(--color-line)]">
        <div className="section-shell">
          <h2 className="feature-heading max-w-3xl">{home.learning.title}</h2>
          <p className="pretty mt-5 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
            {home.learning.body}
          </p>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {home.learning.cards.map((card) => (
              <article
                className="border-t border-[var(--color-line)] pt-6"
                key={card.title}
              >
                <h3 className="text-2xl">{card.title}</h3>
                <p className="pretty mt-4 leading-7 text-[var(--color-muted)]">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
          <Link href="/programs" className="subtle-link mt-8 inline-block">
            Explore our programs →
          </Link>
        </div>
      </section>
    ),
    partners: (
      <section className="section-pad">
        <div className="section-shell">
          <h2 className="feature-heading">{work.partnerTitle}</h2>
          <p className="pretty mb-10 mt-5 max-w-3xl leading-8 text-[var(--color-muted)]">
            {work.partnerIntro}
          </p>
          <PartnerDirectory content={work} />
          <Link href="/partners" className="subtle-link mt-6 inline-block">
            Explore partnerships →
          </Link>
          <div className="mt-12 grid gap-8 lg:grid-cols-2">
            <div>
              <h3 className="text-2xl">{home.process.title}</h3>
              <p className="pretty mt-4 leading-7 text-[var(--color-muted)]">
                {home.process.body}
              </p>
            </div>
            <ol className="grid gap-4">
              {home.process.steps.map((step, index) => (
                <li className="flex gap-4 leading-7" key={step}>
                  <span>{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    ),
    updates: (
      <section className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell">
          <h2 className="feature-heading">{work.updatesTitle}</h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            {posts
              .filter((post) => post.status === "published")
              .slice(0, 4)
              .map((post) => (
                <article
                  className="border-t border-[var(--color-line)] pt-6"
                  key={post.id}
                >
                  <p className="text-sm text-[var(--color-muted)]">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeZone: "UTC",
                    }).format(new Date(post.publishedAt))}
                  </p>
                  <h3 className="mt-3 text-2xl">
                    <Link
                      className="subtle-link"
                      href={`/updates/${post.slug}`}
                    >
                      {post.title}
                    </Link>
                  </h3>
                  <p className="pretty mt-4 leading-7 text-[var(--color-muted)]">
                    {post.summary}
                  </p>
                </article>
              ))}
          </div>
          <Link href="/updates" className="subtle-link mt-8 inline-block">
            All updates →
          </Link>
        </div>
      </section>
    ),
    participate: (
      <section className="section-pad">
        <div className="section-shell">
          <h2 className="feature-heading">{home.closingCta.title}</h2>
          <p className="pretty mt-5 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
            {home.closingCta.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink label="Start a Chapter" href="/chapters" />
            <ButtonLink
              label="Textbook inquiries"
              href="/textbook#inquiry"
              variant="secondary"
            />
            <ButtonLink
              label="Join the beta"
              href="/platform#beta"
              variant="secondary"
            />
            <ButtonLink
              label="Contact us"
              href="/contact"
              variant="secondary"
            />
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {home.audience.cards.map((card) => (
              <Link
                key={card.title}
                href={card.href || "/contact"}
                className="subtle-link leading-7"
              >
                {card.title} →
              </Link>
            ))}
          </div>
        </div>
      </section>
    ),
  };
  return (
    <>
      <section className="relative bg-[var(--color-deep)] text-stone-50">
        <div className="section-shell grid gap-10 py-16 lg:grid-cols-[1.3fr_0.7fr] lg:items-center lg:py-24">
          <div>
            <p className="mb-6 text-sm text-stone-50/80">{home.hero.kicker}</p>
            <h1 className="balance text-[clamp(2.8rem,5.6vw,5rem)] font-light leading-[1.07] tracking-[-0.03em]">
              {home.hero.title}
            </h1>
            <p className="pretty mt-7 max-w-[58ch] text-lg leading-8 text-stone-50/85">
              {home.hero.body}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink {...home.hero.primaryCta} />
              <ButtonLink {...home.hero.secondaryCta} variant="light" />
            </div>
            <Link
              className="subtle-link mt-6 inline-block text-stone-50"
              href="/platform"
            >
              Join the Platform Beta →
            </Link>
          </div>
          <figure className="relative">
            <Image
              src={home.hero.image.src}
              alt={home.hero.image.alt}
              width={640}
              height={720}
              priority
              className="aspect-[4/5] w-full object-cover"
            />
            <figcaption className="mt-3 text-xs leading-5 text-stone-50/75">
              Illustrative classroom image from SetuAI’s existing visual
              library.
            </figcaption>
          </figure>
        </div>
      </section>
      {work.homeOrder.map((id) => (
        <div key={id}>{sections[id]}</div>
      ))}
    </>
  );
}
