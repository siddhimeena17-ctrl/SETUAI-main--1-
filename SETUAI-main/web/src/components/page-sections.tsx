import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/button-link";
import { IconBadge } from "@/components/icon-badge";
import type { PageSection } from "@/content/site";

export function PageSections({ sections }: { sections: PageSection[] }) {
  return (
    <div className="bg-[var(--background)]">
      {sections.map((section, index) => {
        if (section.type === "text") {
          return (
            <section className="section-pad" key={`${section.type}-${index}`}>
              <div className="mx-auto max-w-4xl px-4 md:px-8">
                {section.eyebrow ? <Eyebrow>{section.eyebrow}</Eyebrow> : null}
                <h2 className="balance text-3xl font-light leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl">
                  {section.title}
                </h2>
                <div className="pretty mt-6 grid gap-5 text-lg leading-8 text-[var(--color-ink-soft)]">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
                {section.cta ? <ButtonLink {...section.cta} className="mt-8" /> : null}
              </div>
            </section>
          );
        }

        if (section.type === "cards") {
          return (
            <section className="section-pad bg-[var(--color-surface)]" key={`${section.type}-${index}`}>
              <div className="section-shell">
                <SectionIntro eyebrow={section.eyebrow} title={section.title} body={section.body} />
                <div className="mt-10 grid gap-px bg-[var(--color-line)] md:grid-cols-2 lg:grid-cols-3">
                  {section.cards.map((card) => (
                    <article
                      key={card.title}
                      className="flex min-h-[230px] flex-col bg-[var(--background)] p-6"
                    >
                      <IconBadge icon={card.icon} />
                      {card.eyebrow ? (
                        <p className="mt-5 text-sm font-medium text-[var(--color-coral)]">
                          {card.eyebrow}
                        </p>
                      ) : null}
                      <h3 className="mt-4 text-xl font-normal leading-7 tracking-tight text-[var(--color-ink)]">{card.title}</h3>
                      <p className="pretty mt-3 flex-1 text-sm leading-6 text-[var(--color-muted)]">{card.body}</p>
                      {card.href ? (
                        <Link
                          href={card.href}
                          className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-coral)] hover:text-[var(--color-ink)]"
                        >
                          Learn more
                          <ArrowRight aria-hidden="true" size={15} />
                        </Link>
                      ) : null}
                    </article>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "steps") {
          return (
            <section className="section-pad" key={`${section.type}-${index}`}>
              <div className="section-shell">
                <SectionIntro eyebrow={section.eyebrow} title={section.title} body={section.body} />
                <ol className="mt-10 grid gap-4 md:grid-cols-2">
                  {section.steps.map((step, stepIndex) => (
                    <li
                      key={step.title}
                      className="soft-card grid grid-cols-[auto_1fr] gap-5 p-6"
                    >
                      <span className="grid h-11 w-11 place-items-center bg-[var(--color-deep)] text-sm font-medium text-white">
                        {String(stepIndex + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-lg font-normal text-[var(--color-ink)]">{step.title}</h3>
                        <p className="pretty mt-2 text-sm leading-6 text-[var(--color-muted)]">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          );
        }

        if (section.type === "image") {
          return (
            <section className="section-pad bg-[var(--color-deep)] text-white" key={`${section.type}-${index}`}>
              <div className="section-shell grid gap-10 lg:grid-cols-2">
                <div className="relative min-h-[360px] overflow-hidden">
                  <Image
                    src={section.image}
                    alt={section.imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 48vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  {section.eyebrow ? (
                    <p className="section-kicker section-kicker-accent">
                      {section.eyebrow}
                    </p>
                  ) : null}
                  <h2 className="balance mt-5 text-3xl font-light leading-tight tracking-tight sm:text-4xl">{section.title}</h2>
                  <p className="pretty mt-5 text-lg leading-8 text-white/75">{section.body}</p>
                  {section.cta ? <ButtonLink {...section.cta} variant="light" className="mt-8 w-fit" /> : null}
                </div>
              </div>
            </section>
          );
        }

        if (section.type === "faq") {
          return (
            <section className="section-pad bg-[var(--color-surface)]" key={`${section.type}-${index}`}>
              <div className="mx-auto max-w-4xl px-4 md:px-8">
                <SectionIntro eyebrow={section.eyebrow} title={section.title} />
                <div className="mt-8 divide-y divide-[var(--color-line)] border border-[var(--color-line)] bg-[var(--background)]">
                  {section.faqs.map((faq) => (
                    <details key={faq.question} className="group p-6">
                      <summary className="cursor-pointer list-none text-base font-medium text-[var(--color-ink)] marker:hidden">
                        {faq.question}
                      </summary>
                      <p className="pretty mt-3 text-sm leading-6 text-[var(--color-muted)]">{faq.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            </section>
          );
        }

        return (
          <section className="section-pad bg-[var(--color-coral)] text-white" key={`${section.type}-${index}`}>
            <div className="mx-auto max-w-5xl px-4 text-center md:px-8">
              {section.eyebrow ? (
                <p className="text-sm font-medium text-white/82">
                  {section.eyebrow}
                </p>
              ) : null}
              <h2 className="balance text-3xl font-light leading-tight tracking-tight sm:text-5xl">{section.title}</h2>
              <p className="pretty mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/84">{section.body}</p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                {section.ctas.map((cta) => (
                  <ButtonLink
                    key={cta.href}
                    {...cta}
                    variant={cta.variant === "secondary" ? "secondary" : "light"}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
}) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="balance text-3xl font-light leading-tight tracking-tight text-[var(--color-ink)] sm:text-4xl">{title}</h2>
      {body ? <p className="pretty mt-4 text-lg leading-8 text-[var(--color-muted)]">{body}</p> : null}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <p className="section-kicker mb-3">{children}</p>;
}
