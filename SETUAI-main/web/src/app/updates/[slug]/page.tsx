import Image from "next/image";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { UpdatesSignup } from "@/components/updates-signup";
import { getPost } from "@/lib/cms";
import { articleJsonLd, breadcrumbJsonLd, createMetadata } from "@/lib/seo";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const candidate = await getPost(slug);
  const update = candidate?.status === "published" ? candidate : null;

  if (!update) return {};

  return createMetadata({
    title: update.title,
    description: update.summary,
    path: `/updates/${update.slug}`,
    image: update.image,
  });
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default async function UpdatePage({ params }: Props) {
  const { slug } = await params;
  const candidate = await getPost(slug);
  const update = candidate?.status === "published" ? candidate : null;

  if (!update) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Updates", href: "/updates" },
          { name: update.title, href: `/updates/${update.slug}` },
        ])}
      />
      <JsonLd data={articleJsonLd(update)} />
      <article>
        <section className="bg-[var(--color-surface)]">
          <div className="mx-auto max-w-5xl px-4 py-16 md:px-8 lg:py-24">
            <div className="flex flex-wrap items-center gap-2">
              <span className="border border-[var(--color-coral)] bg-[var(--color-teal-soft)] px-3 py-2 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-coral)]">
                {update.category}
              </span>
              <span className="text-sm font-medium text-[var(--color-muted)]">
                {formatDate(update.publishedAt)}
              </span>
            </div>
            <h1 className="mt-5 text-[clamp(3rem,7vw,5.5rem)] font-light leading-none tracking-tight text-[var(--color-ink)]">
              {update.title}
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg leading-8 text-[var(--color-muted)]">{update.summary}</p>
          </div>
        </section>
        <div className="relative mx-auto -mt-10 aspect-[16/8] max-w-6xl overflow-hidden border border-[var(--color-line)] bg-[var(--background)]">
          <Image
            src={update.image || "/images/skypa-hero-classroom.png"}
            alt={update.imageAlt || update.title}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        <section className="section-pad bg-[var(--background)]">
          <div className="section-shell grid gap-10 lg:grid-cols-[1fr_360px]">
            <div className="grid gap-6 text-lg leading-8 text-[var(--color-muted)]">
              {update.body.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            <aside>
              <UpdatesSignup />
            </aside>
          </div>
        </section>
      </article>
    </>
  );
}
