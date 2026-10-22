import Image from "next/image";
import {
  type InitiativeContent,
  publishedPartners,
} from "@/content/initiatives";
import { safeContentUrl } from "@/lib/initiative-content";

export function PartnerDirectory({ content }: { content: InitiativeContent }) {
  const partners = publishedPartners(content);
  const groups = [...new Set(partners.map((item) => item.category))];
  return (
    <div className="grid gap-10">
      {groups.map((category) => (
        <section key={category}>
          <h3 className="text-lg font-medium">{category}</h3>
          <div className="mt-5 grid gap-x-10 md:grid-cols-2">
            {partners
              .filter((item) => item.category === category)
              .map((item) => (
                <article
                  className="border-t border-[var(--color-line)] py-6"
                  key={item.id}
                >
                  {item.logo && safeContentUrl(item.logo) ? (
                    <Image
                      src={item.logo}
                      alt={`${item.name} logo`}
                      width={160}
                      height={64}
                      className="mb-4 h-16 w-40 object-contain object-left"
                      unoptimized
                    />
                  ) : null}
                  <h4 className="text-2xl">
                    {item.website && safeContentUrl(item.website) ? (
                      <a className="subtle-link" href={item.website}>
                        {item.name}
                      </a>
                    ) : (
                      item.name
                    )}
                  </h4>
                  <p className="mt-3 font-medium">{item.scope}</p>
                  <p className="pretty mt-2 max-w-prose leading-7 text-[var(--color-muted)]">
                    {item.description}
                  </p>
                </article>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
