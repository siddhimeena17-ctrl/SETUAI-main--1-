import Image from "next/image";
import { ButtonLink } from "@/components/button-link";
import type { SitePage } from "@/content/site";

export function PageHero({ page }: { page: SitePage }) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--color-line)] bg-[var(--color-surface)]">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-12 gap-8 px-4 py-16 md:px-8 lg:py-24">
        <div className="col-span-12 flex max-w-[60ch] flex-col justify-center lg:col-span-7">
          <p className="section-kicker">{page.eyebrow}</p>
          <h1 className="balance mt-5 text-[clamp(2.75rem,7vw,5.5rem)] font-light leading-none tracking-tight text-[var(--color-ink)]">
            {page.title}
          </h1>
          <p className="pretty mt-6 max-w-2xl text-lg leading-8 text-[var(--color-ink-soft)]">{page.summary}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {page.cta ? <ButtonLink {...page.cta} /> : null}
            {page.secondaryCta ? <ButtonLink {...page.secondaryCta} /> : null}
          </div>
        </div>
        {page.image ? (
          <div className="relative col-span-12 min-h-[320px] overflow-hidden border border-[var(--color-line)] bg-[var(--background)] lg:col-span-5">
            <Image
              src={page.image}
              alt={page.imageAlt || ""}
              fill
              sizes="(max-width: 1024px) 100vw, 44vw"
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="col-span-12 grid min-h-[320px] grid-cols-2 gap-px bg-[var(--color-line)] lg:col-span-5">
            <div className="bg-[var(--color-deep)] p-5 text-white">
              <p className="text-sm font-medium text-white/70">Education</p>
              <p className="mt-16 text-4xl font-light">AI literacy</p>
            </div>
            <div className="grid gap-px">
              <div className="bg-[var(--color-coral)] p-5 text-white">
                <p className="text-3xl font-light">Access</p>
              </div>
              <div className="bg-[var(--background)] p-5 text-[var(--color-ink)]">
                <p className="text-3xl font-light">Action</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
