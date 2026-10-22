import Image from "next/image";
import {
  type InitiativeContent,
  publishedRecommendations,
} from "@/content/initiatives";
import { safeContentUrl } from "@/lib/initiative-content";

export function letterDate(value: string) {
  if (!value) return "Date not stated in the letter";
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime())
    ? "Date not stated in the letter"
    : new Intl.DateTimeFormat("en", {
        dateStyle: "long",
        timeZone: "UTC",
      }).format(date);
}
export function Recommendations({
  content,
  featured = false,
}: {
  content: InitiativeContent;
  featured?: boolean;
}) {
  const entries = publishedRecommendations(content).filter(
    (item) => !featured || item.featured,
  );
  return (
    <div className={featured ? "recommendation-grid" : "recommendation-list"}>
      {entries.map((item) => (
        <figure key={item.id} id={item.id} className="recommendation">
          {item.logo && safeContentUrl(item.logo) ? (
            <Image
              src={item.logo}
              alt={`${item.organization} logo`}
              width={160}
              height={64}
              className="mb-6 h-16 w-40 object-contain object-left"
              unoptimized
            />
          ) : null}
          <blockquote>
            <p>“{item.excerpt}”</p>
          </blockquote>
          <figcaption>
            <span className="block font-medium">
              {item.signatory || item.organization}
              {item.signatory && item.role ? `, ${item.role}` : ""}
            </span>
            {item.website && safeContentUrl(item.website) ? (
              <a href={item.website} className="subtle-link">
                {item.organization}
                <span className="sr-only"> website</span>
              </a>
            ) : (
              <span>{item.organization}</span>
            )}
            {!featured ? (
              <>
                <p className="mt-4 text-sm">{item.scope}</p>
                <p className="mt-1 text-sm">{letterDate(item.date)}</p>
              </>
            ) : null}
            {item.letterUrl && safeContentUrl(item.letterUrl) ? (
              <a
                href={item.letterUrl}
                className="subtle-link mt-4 block text-sm"
              >
                {item.letterLabel || "Read public letter excerpt (PDF)"}
              </a>
            ) : null}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
