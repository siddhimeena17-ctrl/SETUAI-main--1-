import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/button-link";
import { LeadForm } from "@/components/lead-form";
import { Recommendations } from "@/components/recommendations";
import type { InitiativeContent } from "@/content/initiatives";
import { safeContentUrl } from "@/lib/initiative-content";

export function InitiativeHero({
  title,
  body,
  status,
  children,
}: {
  title: string;
  body: string;
  status?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="section-pad bg-[var(--color-deep)] text-stone-50">
      <div className="section-shell">
        <p className="mb-5 text-sm text-stone-50/80">{status}</p>
        <h1 className="balance max-w-5xl text-[clamp(2.8rem,6vw,5rem)] font-light leading-[1.1] tracking-[-0.025em]">
          {title}
        </h1>
        <p className="pretty mt-7 max-w-3xl text-lg leading-8 text-stone-50/85">
          {body}
        </p>
        {children ? (
          <div className="mt-8 flex flex-wrap gap-3">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-4">
      {items.map((item) => (
        <li
          key={item}
          className="border-t border-[var(--color-line)] pt-4 leading-8"
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
export function TextbookContent({ content }: { content: InitiativeContent }) {
  const book = content.textbook;
  return (
    <>
      <InitiativeHero
        title={book.title}
        body={book.overview}
        status={book.status}
      >
        <ButtonLink href="#inquiry" label="Request a sample" variant="light" />
        <ButtonLink
          href="/recommendations"
          label="Read recommendations"
          variant="light"
        />
      </InitiativeHero>
      <section className="section-pad">
        <div className="section-shell grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="feature-heading">
              A field guide for curious learners.
            </h2>
            <p className="mt-6 text-xl leading-9">{book.audience}</p>
            <p className="pretty mt-5 leading-8 text-[var(--color-muted)]">
              The manuscript combines explanations with guided challenges, case
              studies, and reflection. Educational review and partner use inform
              the work as SetuAI prepares it for publication.
            </p>
            <p className="mt-5 leading-8">
              Public purchase and download details will be shared when
              confirmed.
            </p>
            {book.sampleUrl && safeContentUrl(book.sampleUrl) ? (
              <a
                className="subtle-link mt-6 inline-block"
                href={book.sampleUrl}
              >
                {book.sampleLabel}
              </a>
            ) : (
              <p className="mt-5 leading-8 text-[var(--color-muted)]">
                Request a sample or register publication interest below.
              </p>
            )}
          </div>
          <div>
            <h2 className="text-3xl">What learners explore</h2>
            <BulletList items={book.topics} />
            {book.image && safeContentUrl(book.image) ? (
              <Image
                src={book.image}
                alt={book.imageAlt}
                width={600}
                height={600}
                unoptimized
                className="mt-8 w-full object-contain"
              />
            ) : null}
          </div>
        </div>
      </section>
      <section className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell">
          <h2 className="feature-heading">{content.recommendationTitle}</h2>
          <p className="pretty mt-6 max-w-3xl leading-8 text-[var(--color-muted)]">
            {content.recommendationContext}
          </p>
          <Recommendations content={content} />
          <Link
            href="/recommendations"
            className="subtle-link mt-8 inline-block"
          >
            Browse the recommendation collection →
          </Link>
        </div>
      </section>
      <section id="inquiry" className="section-pad">
        <div className="section-shell grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="feature-heading">
              Bring the textbook into your learning community.
            </h2>
            <p className="pretty mt-6 leading-8 text-[var(--color-muted)]">
              Request a sample, ask about publication updates, or discuss school
              and organizational adoption. Publication interest is an inquiry;
              receiving the newsletter requires its separate opt-in and
              confirmation.
            </p>
          </div>
          <LeadForm formType="textbook" title="Textbook inquiry" />
        </div>
      </section>
    </>
  );
}
export function ChapterContent({ content }: { content: InitiativeContent }) {
  const chapter = content.chapters;
  return (
    <>
      <InitiativeHero
        title={chapter.title}
        body={chapter.overview}
        status={
          chapter.applicationsOpen
            ? "Chapter applications are open"
            : "Chapter program"
        }
      >
        {chapter.applicationsOpen ? (
          <ButtonLink
            label="Apply to start a chapter"
            href="#apply"
            variant="light"
          />
        ) : null}
      </InitiativeHero>
      <section className="section-pad">
        <div className="section-shell grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="feature-heading">Learning, organized locally.</h2>
            <p className="pretty mt-6 text-lg leading-8">{chapter.audience}</p>
            <h3 className="mt-10 text-2xl">What a chapter does</h3>
            <BulletList items={chapter.responsibilities} />
          </div>
          <div>
            <h2 className="text-3xl">Support from SetuAI</h2>
            <BulletList items={chapter.support} />
          </div>
        </div>
      </section>
      <section className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="feature-heading">
              From application to a shared plan.
            </h2>
            <ol className="mt-8 grid gap-6">
              {chapter.process.map((step, index) => (
                <li className="flex gap-5 leading-8" key={step}>
                  <span className="font-medium">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            {chapter.faqs.map((faq) => (
              <details
                className="border-b border-[var(--color-line)] py-5"
                key={faq.question}
              >
                <summary className="cursor-pointer text-lg font-medium">
                  {faq.question} <span aria-hidden="true">+</span>
                </summary>
                <p className="pretty mt-4 leading-8 text-[var(--color-muted)]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section id="apply" className="section-pad">
        <div className="section-shell max-w-4xl">
          {chapter.applicationsOpen ? (
            <LeadForm
              formType="chapter"
              title="Apply to start a SetuAI chapter"
            />
          ) : (
            <p>
              Chapter applications are currently paused.{" "}
              <Link href="/contact" className="subtle-link">
                Contact SetuAI
              </Link>{" "}
              for current information.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
export function PlatformContent({ content }: { content: InitiativeContent }) {
  const platform = content.platform;
  return (
    <>
      <InitiativeHero
        title={platform.title}
        body={platform.overview}
        status={
          platform.betaOpen ? "Open for beta testing" : "AI literacy platform"
        }
      >
        {platform.betaOpen ? (
          <ButtonLink
            href="#beta"
            label="Register beta interest"
            variant="light"
          />
        ) : null}
        {platform.url && safeContentUrl(platform.url) ? (
          <ButtonLink
            href={platform.url}
            label="Visit the platform"
            variant="light"
          />
        ) : null}
      </InitiativeHero>
      <section className="section-pad">
        <div className="section-shell grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="feature-heading">
              Built through international collaboration.
            </h2>
            <p className="pretty mt-6 text-lg leading-8">
              {platform.collaboration}
            </p>
            {platform.image && safeContentUrl(platform.image) ? (
              <Image
                src={platform.image}
                alt={platform.imageAlt}
                width={800}
                height={500}
                className="mt-8 w-full"
                unoptimized
              />
            ) : null}
          </div>
          <div>
            <h2 className="text-3xl">Explore and help us improve</h2>
            <BulletList items={platform.capabilities} />
            <p className="pretty mt-6 leading-8 text-[var(--color-muted)]">
              {platform.feedback}
            </p>
            <Link href="/chapters" className="subtle-link mt-6 inline-block">
              Participate through a chapter →
            </Link>
          </div>
        </div>
      </section>
      <section id="beta" className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell grid gap-12 lg:grid-cols-2">
          <div>
            <h2 className="feature-heading">
              Help shape the next learning experience.
            </h2>
            <p className="pretty mt-6 text-lg leading-8">
              {platform.participation}
            </p>
          </div>
          {platform.betaOpen ? (
            <LeadForm formType="beta" title="Join the beta interest list" />
          ) : (
            <p>
              Beta registration is currently paused. Please{" "}
              <Link href="/contact" className="subtle-link">
                contact SetuAI
              </Link>{" "}
              with questions.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
export function ImpactContent({ content }: { content: InitiativeContent }) {
  const impact = content.impact;
  return (
    <>
      <InitiativeHero
        title={`${impact.value} ${impact.label}`}
        body={impact.description}
        status="Our reach"
      />
      <section className="section-pad">
        <div className="section-shell max-w-3xl">
          <h2 className="feature-heading">What this number describes.</h2>
          <p className="pretty mt-6 text-lg leading-8">{impact.sourceNote}</p>
          {impact.reportingDate ? (
            <p className="mt-5">Reporting date: {impact.reportingDate}</p>
          ) : null}
          <p className="pretty mt-6 leading-8 text-[var(--color-muted)]">
            We distinguish reach from learning outcomes. Projected audiences,
            newsletter subscribers, platform accounts, and verified skill
            development describe different things and are not interchangeable
            with students reached.
          </p>
          <h3 className="mt-10 text-2xl">How we document the work</h3>
          <p className="pretty mt-5 leading-8 text-[var(--color-muted)]">
            Our reporting should identify the activity, reporting period,
            collection method, source record, and review owner. We share
            feedback and corrections with their limitations and preserve the
            context of dated updates.
          </p>
          <Link href="/contact" className="subtle-link mt-6 inline-block">
            Ask about measurement →
          </Link>
        </div>
      </section>
    </>
  );
}
