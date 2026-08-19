import type { Initiative, PageSection, Program, Resource, SitePage, Story, Update } from "@/content/site";
import { isSanityConfigured } from "@/sanity/env";
import { sanityClient } from "@/sanity/client";

const sectionProjection = `sections[]{
  type,
  eyebrow,
  title,
  body,
  "image": image.asset->url,
  imageAlt,
  cta,
  ctas,
  cards,
  steps,
  faqs
}`;

const pageProjection = `{
  title,
  "slug": slug.current,
  eyebrow,
  summary,
  "description": coalesce(description, seo.description, summary),
  "image": heroImage.asset->url,
  imageAlt,
  "cta": primaryCta,
  "secondaryCta": secondaryCta,
  ${sectionProjection}
}`;

async function fetchFromSanity<T>(query: string, params: Record<string, string | number> = {}) {
  if (!isSanityConfigured) return null;

  try {
    return await sanityClient.fetch<T>(query, params, {
      next: { revalidate: 60 },
    });
  } catch {
    return null;
  }
}

function cleanSections(sections: unknown): PageSection[] {
  if (!Array.isArray(sections)) return [];

  return sections
    .filter((section) => section && typeof section === "object")
    .map((section) => {
      const typed = section as Record<string, unknown>;
      const type = typed.type;
      const body = Array.isArray(typed.body)
        ? typed.body.filter((item): item is string => typeof item === "string")
        : typeof typed.body === "string"
          ? [typed.body]
          : [];
      const bodyText = body.join("\n\n");

      const normalized = {
        ...typed,
        body: type === "text" ? body : bodyText,
        cards: Array.isArray(typed.cards) ? typed.cards : [],
        steps: Array.isArray(typed.steps) ? typed.steps : [],
        faqs: Array.isArray(typed.faqs) ? typed.faqs : [],
        ctas: Array.isArray(typed.ctas) ? typed.ctas : [],
      };

      return normalized as unknown as PageSection;
    });
}

function cleanPage<T extends SitePage | Initiative | Program>(page: T | null): T | null {
  if (!page) return null;
  return {
    ...page,
    sections: cleanSections(page.sections),
  };
}

export async function loadSitePage(slug: string) {
  const page = await fetchFromSanity<SitePage | null>(
    `*[_type == "sitePage" && slug.current == $slug][0]${pageProjection}`,
    { slug },
  );
  return cleanPage(page);
}

export async function loadInitiative(slug: string) {
  const page = await fetchFromSanity<Initiative | null>(
    `*[_type == "sitePage" && slug.current == $slug && "initiative" in tags][0]${pageProjection}`,
    { slug },
  );
  return cleanPage(page);
}

export async function loadProgram(slug: string) {
  const program = await fetchFromSanity<Program | null>(
    `*[_type == "program" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      eyebrow,
      summary,
      "description": coalesce(seo.description, summary),
      audience,
      length,
      outcomes,
      modules,
      "cta": {"label": "Request this program", "href": "/contact"},
      ${sectionProjection}
    }`,
    { slug },
  );
  return cleanPage(program);
}

export async function loadPrograms() {
  const list = await fetchFromSanity<Program[] | null>(
    `*[_type == "program"] | order(title asc){
      title,
      "slug": slug.current,
      eyebrow,
      summary,
      "description": coalesce(seo.description, summary),
      audience,
      length,
      outcomes,
      modules,
      ${sectionProjection}
    }`,
  );
  return list?.map((item) => cleanPage(item)).filter(Boolean) as Program[] | null;
}

export async function loadStory(slug: string) {
  return fetchFromSanity<Story | null>(
    `*[_type == "story" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      eyebrow,
      summary,
      "body": [pt::text(body)],
      "image": image.asset->url,
      imageAlt,
      tags
    }`,
    { slug },
  );
}

export async function loadStories() {
  return fetchFromSanity<Story[] | null>(
    `*[_type == "story"] | order(_createdAt desc){
      title,
      "slug": slug.current,
      eyebrow,
      summary,
      "body": [pt::text(body)],
      "image": image.asset->url,
      imageAlt,
      tags
    }`,
  );
}

export async function loadResource(slug: string) {
  return fetchFromSanity<Resource | null>(
    `*[_type == "resource" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      type,
      audience,
      minutes,
      summary,
      "body": [pt::text(body)]
    }`,
    { slug },
  );
}

export async function loadResources() {
  return fetchFromSanity<Resource[] | null>(
    `*[_type == "resource"] | order(title asc){
      title,
      "slug": slug.current,
      type,
      audience,
      minutes,
      summary,
      "body": [pt::text(body)]
    }`,
  );
}

export async function loadUpdate(slug: string) {
  return fetchFromSanity<Update | null>(
    `*[_type == "update" && slug.current == $slug][0]{
      title,
      "slug": slug.current,
      category,
      summary,
      publishedAt,
      "body": [pt::text(body)],
      "image": image.asset->url,
      imageAlt
    }`,
    { slug },
  );
}

export async function loadUpdates() {
  return fetchFromSanity<Update[] | null>(
    `*[_type == "update" && defined(slug.current)] | order(publishedAt desc){
      title,
      "slug": slug.current,
      category,
      summary,
      publishedAt,
      "body": [pt::text(body)],
      "image": image.asset->url,
      imageAlt
    }`,
  );
}
