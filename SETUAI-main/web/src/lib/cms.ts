import { createHash, randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import { fallbackSiteContent, siteContentSchemaVersion, type EditableSiteContent } from "@/content/editable-site";
import { corePages, programs, siteConfig, updates, type PageSection, type Program, type SitePage, type Update } from "@/content/site";

export type CmsStatus = "draft" | "published";

export type CmsPost = Update & {
  id: string;
  status: CmsStatus;
  author?: string;
  updatedAt: string;
  notificationStatus?: "not-sent" | "sent" | "failed";
};

export type CmsPage = SitePage & {
  id: string;
  status: CmsStatus;
  updatedAt: string;
};

export type CmsProgram = Program & {
  id: string;
  status: CmsStatus;
  updatedAt: string;
};

export type GalleryAlbum = {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  images: string[];
  status: CmsStatus;
  updatedAt: string;
};

export type CmsSettings = {
  siteName: string;
  tagline: string;
  contactEmail: string;
  announcement: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  updatedAt: string;
};

export type CmsSubmission = {
  id: string;
  formType: string;
  name: string;
  email: string;
  organization: string;
  interest: string;
  message: string;
  createdAt: string;
  read: boolean;
  status: "new" | "in-progress" | "closed";
  privacyAcknowledged: boolean;
  updatesOptIn: boolean;
  assignedTo?: string;
  notes?: string;
};

export type CmsSubscriber = {
  id: string;
  email: string;
  name: string;
  source: string;
  active: boolean;
  confirmedAt?: string;
  consentAt?: string;
  confirmationTokenHash?: string;
  unsubscribeTokenHash: string;
  createdAt: string;
  updatedAt: string;
};

export type CmsMediaUpload = {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  alt: string;
  data: string;
  createdAt: string;
};

const keys = {
  posts: "skypa:cms:posts",
  pages: "skypa:cms:pages",
  programs: "skypa:cms:programs",
  gallery: "skypa:cms:gallery",
  settings: "skypa:cms:settings",
  siteContent: "skypa:cms:site-content",
  media: "skypa:cms:media:",
  submissions: "skypa:cms:submissions",
  subscribers: "skypa:cms:subscribers",
};

function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

function parseStored<T>(value: unknown): T | null {
  if (!value) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  }
  return value as T;
}

async function readValue<T>(key: string): Promise<T | null> {
  const client = redis();
  if (!client) return null;

  try {
    return parseStored<T>(await client.get(key));
  } catch {
    return null;
  }
}

async function writeValue<T>(key: string, value: T) {
  const client = redis();
  if (!client) {
    throw new Error("Upstash is not configured.");
  }

  await client.set(key, value);
}

function now() {
  return new Date().toISOString();
}

function tokenHash(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function idFromSlug(prefix: string, slug: string) {
  return `${prefix}-${slug}`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function fallbackPosts(): CmsPost[] {
  return updates.map((update) => ({
    ...update,
    id: idFromSlug("post", update.slug),
    status: "published",
    updatedAt: update.publishedAt,
    notificationStatus: "not-sent",
  }));
}

function fallbackPages(): CmsPage[] {
  return corePages.map((page) => ({
    ...page,
    id: idFromSlug("page", page.slug),
    status: "published",
    updatedAt: now(),
  }));
}

function fallbackPrograms(): CmsProgram[] {
  return programs.map((program) => ({
    ...program,
    id: idFromSlug("program", program.slug),
    status: "published",
    updatedAt: now(),
  }));
}

export const fallbackSettings: CmsSettings = {
  siteName: siteConfig.name,
  tagline: siteConfig.tagline,
  contactEmail: siteConfig.email,
  announcement: "SetuAI is actively building practical AI literacy with schools, education nonprofits, and partner organizations.",
  primaryCtaLabel: "Start a conversation",
  primaryCtaHref: "/contact",
  updatedAt: now(),
};

async function readCollection<T>(key: string, fallback: T[]) {
  const stored = await readValue<T[]>(key);
  return stored?.length ? stored : fallback;
}

async function writeCollection<T extends { id: string }>(key: string, items: T[]) {
  await writeValue(key, items);
}

export async function getPosts() {
  return readCollection<CmsPost>(keys.posts, fallbackPosts());
}

export async function getStoredPosts() {
  return readValue<CmsPost[]>(keys.posts);
}

export async function getPublishedPosts() {
  const stored = await getStoredPosts();
  return stored?.filter((post) => post.status === "published") || null;
}

export async function getPost(idOrSlug: string) {
  const posts = await getPosts();
  return posts.find((post) => post.id === idOrSlug || post.slug === idOrSlug) || null;
}

export async function savePost(input: Partial<CmsPost>) {
  const posts = await getPosts();
  const slug = slugify(input.slug || input.title || "update");
  const id = input.id || crypto.randomUUID();
  const post: CmsPost = {
    id,
    slug,
    title: input.title || "Untitled update",
    category: input.category || "announcement",
    summary: input.summary || "",
    publishedAt: input.publishedAt || now(),
    body: Array.isArray(input.body) ? input.body : [],
    image: input.image || "/images/skypa-hero-classroom.png",
    imageAlt: input.imageAlt || input.title || "SetuAI update",
    status: input.status || "draft",
    author: input.author || "SetuAI",
    updatedAt: now(),
    notificationStatus: input.notificationStatus || "not-sent",
  };
  const nextPosts = [post, ...posts.filter((item) => item.id !== id)];
  await writeCollection(keys.posts, nextPosts);
  return post;
}

export async function deletePost(id: string) {
  const posts = await getPosts();
  await writeCollection(keys.posts, posts.filter((post) => post.id !== id));
}

export async function getPages() {
  return readCollection<CmsPage>(keys.pages, fallbackPages());
}

export async function getPage(idOrSlug: string) {
  const pages = await getPages();
  return pages.find((page) => page.id === idOrSlug || page.slug === idOrSlug) || null;
}

export async function savePage(input: Partial<CmsPage>) {
  const pages = await getPages();
  const existing = input.id ? pages.find((item) => item.id === input.id) : undefined;
  const slug = slugify(input.slug || existing?.slug || input.title || "page");
  const id = input.id || idFromSlug("page", slug);
  const page: CmsPage = {
    id,
    slug,
    title: input.title || "Untitled page",
    eyebrow: input.eyebrow || existing?.eyebrow || "SetuAI",
    summary: input.summary || "",
    description: input.description || input.summary || "",
    image: input.image || existing?.image,
    imageAlt: input.imageAlt || existing?.imageAlt,
    cta: input.cta || existing?.cta,
    secondaryCta: input.secondaryCta || existing?.secondaryCta,
    sections: Array.isArray(input.sections) ? (input.sections as PageSection[]) : existing?.sections || [],
    status: input.status || "draft",
    updatedAt: now(),
  };
  await writeCollection(keys.pages, [page, ...pages.filter((item) => item.id !== id)]);
  return page;
}

export async function getPrograms() {
  return readCollection<CmsProgram>(keys.programs, fallbackPrograms());
}

export async function getProgramEntry(idOrSlug: string) {
  const entries = await getPrograms();
  return entries.find((program) => program.id === idOrSlug || program.slug === idOrSlug) || null;
}

export async function saveProgram(input: Partial<CmsProgram>) {
  const entries = await getPrograms();
  const slug = slugify(input.slug || input.title || "program");
  const id = input.id || idFromSlug("program", slug);
  const entry: CmsProgram = {
    id,
    slug,
    title: input.title || "Untitled program",
    eyebrow: input.eyebrow || "Program in development",
    summary: input.summary || "",
    description: input.description || input.summary || "",
    image: input.image,
    imageAlt: input.imageAlt,
    cta: input.cta,
    secondaryCta: input.secondaryCta,
    sections: Array.isArray(input.sections) ? (input.sections as PageSection[]) : [],
    audience: input.audience || "",
    length: input.length || "",
    outcomes: input.outcomes || [],
    modules: input.modules || [],
    status: input.status || "draft",
    updatedAt: now(),
  };
  await writeCollection(keys.programs, [entry, ...entries.filter((item) => item.id !== id)]);
  return entry;
}

export async function getGalleryAlbums() {
  return readCollection<GalleryAlbum>(keys.gallery, []);
}

export async function getGalleryAlbum(id: string) {
  const albums = await getGalleryAlbums();
  return albums.find((album) => album.id === id) || null;
}

export async function saveGalleryAlbum(input: Partial<GalleryAlbum>) {
  const albums = await getGalleryAlbums();
  const id = input.id || crypto.randomUUID();
  const album: GalleryAlbum = {
    id,
    title: input.title || "Untitled album",
    description: input.description || "",
    coverImage: input.coverImage || "",
    images: input.images || [],
    status: input.status || "draft",
    updatedAt: now(),
  };
  await writeCollection(keys.gallery, [album, ...albums.filter((item) => item.id !== id)]);
  return album;
}

export async function deleteGalleryAlbum(id: string) {
  const albums = await getGalleryAlbums();
  await writeCollection(keys.gallery, albums.filter((album) => album.id !== id));
}

export async function getSettings() {
  return (await readValue<CmsSettings>(keys.settings)) || fallbackSettings;
}

export async function saveSettings(input: Partial<CmsSettings>) {
  const settings: CmsSettings = {
    ...(await getSettings()),
    ...input,
    updatedAt: now(),
  };
  await writeValue(keys.settings, settings);
  return settings;
}

function mergeSiteContent(input: Partial<EditableSiteContent> | null): EditableSiteContent {
  const migratedInput = migrateLegacySiteContent(input);
  const home = (migratedInput?.home || {}) as Partial<EditableSiteContent["home"]>;

  return {
    contentVersion: siteContentSchemaVersion,
    global: {
      ...fallbackSiteContent.global,
      ...migratedInput?.global,
      logo: {
        ...fallbackSiteContent.global.logo,
        ...migratedInput?.global?.logo,
      },
      navCta: {
        ...fallbackSiteContent.global.navCta,
        ...migratedInput?.global?.navCta,
      },
      navigation: migratedInput?.global?.navigation || fallbackSiteContent.global.navigation,
      footerColumns: migratedInput?.global?.footerColumns || fallbackSiteContent.global.footerColumns,
      footerUtilityLinks: migratedInput?.global?.footerUtilityLinks || fallbackSiteContent.global.footerUtilityLinks,
      foundingPartners: migratedInput?.global?.foundingPartners || fallbackSiteContent.global.foundingPartners,
    },
    seo: {
      ...fallbackSiteContent.seo,
      ...migratedInput?.seo,
    },
    home: {
      ...fallbackSiteContent.home,
      ...home,
      hero: {
        ...fallbackSiteContent.home.hero,
        ...home.hero,
        image: {
          ...fallbackSiteContent.home.hero.image,
          ...home.hero?.image,
        },
        primaryCta: {
          ...fallbackSiteContent.home.hero.primaryCta,
          ...home.hero?.primaryCta,
        },
        secondaryCta: {
          ...fallbackSiteContent.home.hero.secondaryCta,
          ...home.hero?.secondaryCta,
        },
      },
      intro: {
        ...fallbackSiteContent.home.intro,
        ...home.intro,
        body: home.intro?.body || fallbackSiteContent.home.intro.body,
      },
      stats: home.stats || fallbackSiteContent.home.stats,
      learning: {
        ...fallbackSiteContent.home.learning,
        ...home.learning,
        cards: home.learning?.cards || fallbackSiteContent.home.learning.cards,
      },
      heartbeat: {
        ...fallbackSiteContent.home.heartbeat,
        ...home.heartbeat,
        image: {
          ...fallbackSiteContent.home.heartbeat.image,
          ...home.heartbeat?.image,
        },
        pulses: home.heartbeat?.pulses || fallbackSiteContent.home.heartbeat.pulses,
      },
      textbook: {
        ...fallbackSiteContent.home.textbook,
        ...home.textbook,
        image: {
          ...fallbackSiteContent.home.textbook.image,
          ...home.textbook?.image,
        },
        bullets: home.textbook?.bullets || fallbackSiteContent.home.textbook.bullets,
        primaryCta: {
          ...fallbackSiteContent.home.textbook.primaryCta,
          ...home.textbook?.primaryCta,
        },
        secondaryCta: {
          ...fallbackSiteContent.home.textbook.secondaryCta,
          ...home.textbook?.secondaryCta,
        },
      },
      audience: {
        ...fallbackSiteContent.home.audience,
        ...home.audience,
        cards: home.audience?.cards || fallbackSiteContent.home.audience.cards,
      },
      process: {
        ...fallbackSiteContent.home.process,
        ...home.process,
        steps: home.process?.steps || fallbackSiteContent.home.process.steps,
      },
      closingCta: {
        ...fallbackSiteContent.home.closingCta,
        ...home.closingCta,
        primaryCta: {
          ...fallbackSiteContent.home.closingCta.primaryCta,
          ...home.closingCta?.primaryCta,
        },
        secondaryCta: {
          ...fallbackSiteContent.home.closingCta.secondaryCta,
          ...home.closingCta?.secondaryCta,
        },
      },
    },
    visuals: {
      ...fallbackSiteContent.visuals,
      ...migratedInput?.visuals,
    },
    updatedAt: migratedInput?.updatedAt || fallbackSiteContent.updatedAt,
  };
}

function migrateLegacySiteContent(input: Partial<EditableSiteContent> | null) {
  if (!input) return input;

  if (input.contentVersion === siteContentSchemaVersion) {
    return input;
  }

  // The former launch content contained outdated projected claims. Until an
  // editor intentionally saves the new active-content model, render the
  // honest baseline rather than revive those old claims from Redis.
  return fallbackSiteContent;
}


export async function getSiteContent() {
  return replaceLegacySetuAiArtwork(mergeSiteContent(await readValue<EditableSiteContent>(keys.siteContent)));
}

export async function saveSiteContent(input: Partial<EditableSiteContent>) {
  const existing = await getSiteContent();
  const siteContent: EditableSiteContent = {
    contentVersion: siteContentSchemaVersion,
    global: {
      ...existing.global,
      ...input.global,
    },
    seo: {
      ...existing.seo,
      ...input.seo,
    },
    home: {
      ...existing.home,
      ...input.home,
    },
    visuals: {
      ...existing.visuals,
      ...input.visuals,
    },
    updatedAt: now(),
  };
  const normalizedSiteContent = replaceLegacySetuAiArtwork(siteContent);
  await writeValue(keys.siteContent, normalizedSiteContent);
  return normalizedSiteContent;
}

function replaceLegacySetuAiArtwork(content: EditableSiteContent): EditableSiteContent {
  if (content.home.heartbeat.image.src !== "/images/skypa-higgsfield-heart.png") return content;

  return {
    ...content,
    home: {
      ...content.home,
      heartbeat: {
        ...content.home.heartbeat,
        image: {
          src: "/images/skypa-partnership-workshop.png",
          alt: "Concept image of educators and students collaborating around learning materials.",
        },
      },
    },
  };
}

export async function saveMediaUpload(input: Omit<CmsMediaUpload, "createdAt">) {
  const media: CmsMediaUpload = {
    ...input,
    createdAt: now(),
  };
  await writeValue(`${keys.media}${media.id}`, media);
  return media;
}

export async function getMediaUpload(id: string) {
  return readValue<CmsMediaUpload>(`${keys.media}${id}`);
}

export async function getSubmissions() {
  return readCollection<CmsSubmission>(keys.submissions, []);
}

export async function saveSubmission(input: Omit<CmsSubmission, "id" | "createdAt" | "read">) {
  const submissions = await getSubmissions();
  const submission: CmsSubmission = {
    id: crypto.randomUUID(),
    ...input,
    createdAt: now(),
    read: false,
  };
  await writeCollection(keys.submissions, [submission, ...submissions]);
  return submission;
}

export async function markSubmissionRead(id: string) {
  const submissions = await getSubmissions();
  await writeCollection(
    keys.submissions,
    submissions.map((submission) => (submission.id === id ? { ...submission, read: true } : submission)),
  );
}

export async function updateSubmission(id: string, input: Partial<Pick<CmsSubmission, "status" | "assignedTo" | "notes" | "read">>) {
  const submissions = await getSubmissions();
  const existing = submissions.find((submission) => submission.id === id);
  if (!existing) return null;

  const next = { ...existing, ...input };
  await writeCollection(
    keys.submissions,
    submissions.map((submission) => (submission.id === id ? next : submission)),
  );
  return next;
}

export async function getSubscribers() {
  return readCollection<CmsSubscriber>(keys.subscribers, []);
}

export async function saveSubscriber(
  input: Omit<CmsSubscriber, "id" | "createdAt" | "updatedAt" | "active" | "unsubscribeTokenHash"> & {
    active?: boolean;
    unsubscribeTokenHash?: string;
  },
) {
  const subscribers = await getSubscribers();
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = subscribers.find((subscriber) => subscriber.email === normalizedEmail);
  const subscriber: CmsSubscriber = {
    id: existing?.id || crypto.randomUUID(),
    email: normalizedEmail,
    name: input.name || existing?.name || "",
    source: input.source || existing?.source || "updates-page",
    active: input.active ?? true,
    confirmedAt: input.confirmedAt ?? existing?.confirmedAt,
    consentAt: input.consentAt ?? existing?.consentAt,
    confirmationTokenHash: input.confirmationTokenHash ?? existing?.confirmationTokenHash,
    unsubscribeTokenHash: input.unsubscribeTokenHash || existing?.unsubscribeTokenHash || tokenHash(randomUUID()),
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };
  await writeCollection(keys.subscribers, [subscriber, ...subscribers.filter((item) => item.id !== subscriber.id)]);
  return subscriber;
}

export async function createPendingSubscriber(input: { email: string; name?: string; source: string }) {
  const subscribers = await getSubscribers();
  const email = input.email.trim().toLowerCase();
  const existing = subscribers.find((subscriber) => subscriber.email === email);

  if (existing?.active && existing.confirmedAt) {
    return { subscriber: existing, confirmationToken: null, unsubscribeToken: null, alreadyConfirmed: true };
  }

  const confirmationToken = randomUUID();
  const unsubscribeToken = randomUUID();
  const subscriber: CmsSubscriber = {
    id: existing?.id || randomUUID(),
    email,
    name: input.name || existing?.name || "",
    source: input.source || existing?.source || "updates-page",
    active: false,
    consentAt: now(),
    confirmationTokenHash: tokenHash(confirmationToken),
    unsubscribeTokenHash: existing?.unsubscribeTokenHash || tokenHash(unsubscribeToken),
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };

  await writeCollection(keys.subscribers, [subscriber, ...subscribers.filter((item) => item.id !== subscriber.id)]);
  return { subscriber, confirmationToken, unsubscribeToken, alreadyConfirmed: false };
}

export async function confirmSubscriber(token: string) {
  const subscribers = await getSubscribers();
  const tokenDigest = tokenHash(token);
  const existing = subscribers.find((subscriber) => subscriber.confirmationTokenHash === tokenDigest);
  if (!existing) return null;

  const subscriber: CmsSubscriber = {
    ...existing,
    active: true,
    confirmedAt: now(),
    confirmationTokenHash: undefined,
    updatedAt: now(),
  };
  await writeCollection(keys.subscribers, [subscriber, ...subscribers.filter((item) => item.id !== subscriber.id)]);
  return subscriber;
}

export async function unsubscribeSubscriber(token: string) {
  const subscribers = await getSubscribers();
  const tokenDigest = tokenHash(token);
  const existing = subscribers.find((subscriber) => subscriber.unsubscribeTokenHash === tokenDigest);
  if (!existing) return null;

  const subscriber: CmsSubscriber = { ...existing, active: false, updatedAt: now() };
  await writeCollection(keys.subscribers, [subscriber, ...subscribers.filter((item) => item.id !== subscriber.id)]);
  return subscriber;
}

export async function createUnsubscribeToken(subscriberId: string) {
  const subscribers = await getSubscribers();
  const existing = subscribers.find((subscriber) => subscriber.id === subscriberId);
  if (!existing) return null;

  const token = randomUUID();
  const subscriber: CmsSubscriber = {
    ...existing,
    unsubscribeTokenHash: tokenHash(token),
    updatedAt: now(),
  };
  await writeCollection(keys.subscribers, [subscriber, ...subscribers.filter((item) => item.id !== subscriber.id)]);
  return token;
}

export async function getDashboardSummary() {
  const [posts, pages, programEntries, albums, submissions, subscribers] = await Promise.all([
    getPosts(),
    getPages(),
    getPrograms(),
    getGalleryAlbums(),
    getSubmissions(),
    getSubscribers(),
  ]);

  return {
    posts,
    pages,
    programs: programEntries,
    albums,
    submissions,
    subscribers,
    stats: {
      publishedPosts: posts.filter((post) => post.status === "published").length,
      drafts: posts.filter((post) => post.status === "draft").length,
      pages: pages.length,
      programs: programEntries.length,
      albums: albums.length,
      unreadMessages: submissions.filter((submission) => !submission.read).length,
      subscribers: subscribers.filter((subscriber) => subscriber.active).length,
    },
  };
}
