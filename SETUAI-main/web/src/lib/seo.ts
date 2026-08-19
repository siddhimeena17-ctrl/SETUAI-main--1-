import type { Metadata } from "next";
import type { Update } from "@/content/site";
import { siteConfig } from "@/content/site";
import { absoluteUrl } from "@/lib/utils";

type SeoInput = {
  title: string;
  description: string;
  path?: string;
  image?: string;
};

export function createMetadata({
  title,
  description,
  path = "/",
  image = siteConfig.image,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: siteConfig.name,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteConfig.name} AI literacy initiative`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    sameAs: [],
    knowsAbout: [
      "AI literacy",
      "Artificial intelligence education",
      "Responsible AI",
      "School partnerships",
      "Youth technology education",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
  };
}

export function articleJsonLd(update: Pick<Update, "title" | "summary" | "slug" | "publishedAt" | "image">) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: update.title,
    description: update.summary,
    datePublished: update.publishedAt,
    dateModified: update.publishedAt,
    mainEntityOfPage: absoluteUrl(`/updates/${update.slug}`),
    image: update.image ? [absoluteUrl(update.image)] : undefined,
    author: { "@type": "Organization", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };
}

export function breadcrumbJsonLd(items: { name: string; href: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}
