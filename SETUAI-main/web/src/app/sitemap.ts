import type { MetadataRoute } from "next";
import { allStaticPaths } from "@/content/site";
import { getPages, getPrograms, getPublishedPosts } from "@/lib/cms";
import { absoluteUrl } from "@/lib/utils";

function validDate(value: string | undefined) {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, programs, posts] = await Promise.all([getPages(), getPrograms(), getPublishedPosts()]);
  const byUrl = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const path of allStaticPaths) {
    byUrl.set(absoluteUrl(path), {
      url: absoluteUrl(path),
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
    });
  }

  for (const page of pages.filter((entry) => entry.status === "published")) {
    byUrl.set(absoluteUrl(`/${page.slug}`), {
      url: absoluteUrl(`/${page.slug}`),
      lastModified: validDate(page.updatedAt),
      changeFrequency: "monthly",
      priority: page.slug === "about" ? 0.9 : 0.75,
    });
  }

  for (const program of programs.filter((entry) => entry.status === "published")) {
    byUrl.set(absoluteUrl(`/programs/${program.slug}`), {
      url: absoluteUrl(`/programs/${program.slug}`),
      lastModified: validDate(program.updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const post of posts || []) {
    byUrl.set(absoluteUrl(`/updates/${post.slug}`), {
      url: absoluteUrl(`/updates/${post.slug}`),
      lastModified: validDate(post.updatedAt || post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.65,
    });
  }

  return [...byUrl.values()];
}
