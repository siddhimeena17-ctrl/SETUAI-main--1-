import {
  defaultInitiatives,
  newPartner,
  type PartnerEntry,
} from "@/content/initiatives";
import { mergeInitiatives } from "@/lib/initiative-content";
import { createHash, randomUUID } from "crypto";
import { Redis } from "@upstash/redis";
import {
  fallbackSiteContent,
  siteContentSchemaVersion,
  type EditableSiteContent,
} from "@/content/editable-site";
import {
  corePages,
  programs,
  siteConfig,
  updates,
  type PageSection,
  type Program,
  type SitePage,
  type Update,
} from "@/content/site";

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
  sourcePage?: string;
  fields?: Record<string, string>;
  notificationStatus?: "pending" | "sent" | "failed";
  notificationError?: string;
  notifiedAt?: string;
  providerMessageId?: string;
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
  announcement:
    "SetuAI is actively building practical AI literacy with schools, education nonprofits, and partner organizations.",
  primaryCtaLabel: "Start a conversation",
  primaryCtaHref: "/contact",
  updatedAt: now(),
};

async function readCollection<T>(key: string, fallback: T[]) {
  const stored = await readValue<T[]>(key);
  return stored?.length ? stored : fallback;
}

async function writeCollection<T extends { id: string }>(
  key: string,
  items: T[],
) {
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
  return (
    posts.find((post) => post.id === idOrSlug || post.slug === idOrSlug) || null
  );
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
  await writeCollection(
    keys.posts,
    posts.filter((post) => post.id !== id),
  );
}

function currentGeneralContact<T>(value: T): T {
  if (typeof value === "string")
    return value.replaceAll("hello@setuai.org", "setuai.edu@gmail.com") as T;
  if (Array.isArray(value))
    return value.map((item) => currentGeneralContact(item)) as T;
  if (value && typeof value === "object")
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        currentGeneralContact(item),
      ]),
    ) as T;
  return value;
}

export async function getPages() {
  const pages = currentGeneralContact(
    await readCollection<CmsPage>(keys.pages, fallbackPages()),
  );
  return pages.map((page) => {
    if (
      page.slug !== "privacy" ||
      JSON.stringify(page.sections).includes("Chapter applications")
    )
      return page;
    return {
      ...page,
      sections: [
        ...page.sections,
        {
          type: "text" as const,
          title: "Chapter and beta requests",
          body: [
            "Chapter applications ask for city, country, proposed setting, motivation, experience, activities, and estimated participation. Beta requests ask about role and participation interests. SetuAI stores these details for review and follow-up. Neither form subscribes applicants to marketing updates.",
          ],
        },
      ],
    };
  });
}

export async function getPage(idOrSlug: string) {
  const pages = await getPages();
  return (
    pages.find((page) => page.id === idOrSlug || page.slug === idOrSlug) || null
  );
}

export async function savePage(input: Partial<CmsPage>) {
  const pages = await getPages();
  const existing = input.id
    ? pages.find((item) => item.id === input.id)
    : undefined;
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
    sections: Array.isArray(input.sections)
      ? (input.sections as PageSection[])
      : existing?.sections || [],
    status: input.status || "draft",
    updatedAt: now(),
  };
  await writeCollection(keys.pages, [
    page,
    ...pages.filter((item) => item.id !== id),
  ]);
  return page;
}

export async function getPrograms() {
  return readCollection<CmsProgram>(keys.programs, fallbackPrograms());
}

export async function getProgramEntry(idOrSlug: string) {
  const entries = await getPrograms();
  return (
    entries.find(
      (program) => program.id === idOrSlug || program.slug === idOrSlug,
    ) || null
  );
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
    sections: Array.isArray(input.sections)
      ? (input.sections as PageSection[])
      : [],
    audience: input.audience || "",
    length: input.length || "",
    outcomes: input.outcomes || [],
    modules: input.modules || [],
    status: input.status || "draft",
    updatedAt: now(),
  };
  await writeCollection(keys.programs, [
    entry,
    ...entries.filter((item) => item.id !== id),
  ]);
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
  await writeCollection(keys.gallery, [
    album,
    ...albums.filter((item) => item.id !== id),
  ]);
  return album;
}

export async function deleteGalleryAlbum(id: string) {
  const albums = await getGalleryAlbums();
  await writeCollection(
    keys.gallery,
    albums.filter((album) => album.id !== id),
  );
}

export async function getSettings() {
  const settings =
    (await readValue<CmsSettings>(keys.settings)) || fallbackSettings;
  return { ...settings, contactEmail: "setuai.edu@gmail.com" };
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

export function mergeSiteContent(
  input: Partial<EditableSiteContent> | null,
): EditableSiteContent {
  const migratedInput = migrateLegacySiteContent(input);
  const home = (migratedInput?.home || {}) as Partial<
    EditableSiteContent["home"]
  >;

  return {
    contentVersion: siteContentSchemaVersion,
    initiatives: mergeInitiatives(migratedInput?.initiatives),
    global: {
      ...fallbackSiteContent.global,
      ...migratedInput?.global,
      email: "setuai.edu@gmail.com",
      logo: {
        ...fallbackSiteContent.global.logo,
        ...migratedInput?.global?.logo,
      },
      navCta: {
        ...fallbackSiteContent.global.navCta,
        ...migratedInput?.global?.navCta,
      },
      navigation:
        migratedInput?.global?.navigation ||
        fallbackSiteContent.global.navigation,
      footerColumns:
        migratedInput?.global?.footerColumns ||
        fallbackSiteContent.global.footerColumns,
      footerUtilityLinks:
        migratedInput?.global?.footerUtilityLinks ||
        fallbackSiteContent.global.footerUtilityLinks,
      foundingPartners:
        migratedInput?.global?.foundingPartners ||
        fallbackSiteContent.global.foundingPartners,
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
        pulses:
          home.heartbeat?.pulses || fallbackSiteContent.home.heartbeat.pulses,
      },
      textbook: {
        ...fallbackSiteContent.home.textbook,
        ...home.textbook,
        image: {
          ...fallbackSiteContent.home.textbook.image,
          ...home.textbook?.image,
        },
        bullets:
          home.textbook?.bullets || fallbackSiteContent.home.textbook.bullets,
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
  if (!input || input.contentVersion === siteContentSchemaVersion) return input;
  // A scoped read-through migration. Unrelated copy, visuals, pages, posts,
  // media, and editorial settings survive; no Redis data is written on read.
  const oldNavigation = input.global?.navigation || [];
  const allKnown = new Set(
    fallbackSiteContent.global.navigation.flatMap((item) => [
      item.href,
      ...(item.children || []).map((child) => child.href),
    ]),
  );
  return {
    ...input,
    initiatives: input.initiatives || {
      ...defaultInitiatives,
      partners: [
        ...(
          input.global?.foundingPartners ||
          fallbackSiteContent.global.foundingPartners
        ).map((partner, order): PartnerEntry => ({
          ...newPartner,
          id: `founding-${order}`,
          name: partner.name,
          website: partner.href,
          scope: partner.role,
          description: partner.body,
          category: partner.role.toLowerCase().includes("technology")
            ? "Technology partnership"
            : "Founding collaboration",
          status: "published",
          approval: "approved",
          order,
        })),
        ...defaultInitiatives.partners.filter((partner) =>
          partner.id.startsWith("education-"),
        ),
      ],
    },
    global: {
      ...fallbackSiteContent.global,
      ...input.global,
      email: "setuai.edu@gmail.com",
      navCta: fallbackSiteContent.global.navCta,
      navigation: [
        ...fallbackSiteContent.global.navigation.map((item) =>
          item.href === "/get-involved"
            ? {
                ...item,
                children: [
                  ...(item.children || []),
                  ...oldNavigation
                    .filter((old) => allKnown.has(old.href))
                    .flatMap((old) => old.children || [])
                    .filter((child) => !allKnown.has(child.href)),
                ],
              }
            : item,
        ),
        ...oldNavigation.filter((item) => !allKnown.has(item.href)),
      ],
      footerColumns: (
        input.global?.footerColumns || fallbackSiteContent.global.footerColumns
      ).map((column, index) => ({
        ...column,
        links: [
          ...column.links,
          ...(index === 0
            ? [
                { label: "Chapters", href: "/chapters" },
                { label: "Platform beta", href: "/platform" },
                { label: "Recommendations", href: "/recommendations" },
              ].filter(
                (link) => !column.links.some((old) => old.href === link.href),
              )
            : []),
        ],
      })),
    },
    seo: { ...input.seo, ...fallbackSiteContent.seo },
    home: {
      ...input.home,
      hero: {
        ...fallbackSiteContent.home.hero,
        image: input.home?.hero?.image || fallbackSiteContent.home.hero.image,
      },
      textbook: {
        ...fallbackSiteContent.home.textbook,
        image:
          input.home?.textbook?.image ||
          fallbackSiteContent.home.textbook.image,
      },
      stats: fallbackSiteContent.home.stats,
    } as EditableSiteContent["home"],
  };
}

export async function getSiteContent() {
  return currentGeneralContact(
    replaceLegacySetuAiArtwork(
      mergeSiteContent(await readValue<EditableSiteContent>(keys.siteContent)),
    ),
  );
}

export async function saveSiteContent(input: Partial<EditableSiteContent>) {
  const existing = await getSiteContent();
  const siteContent: EditableSiteContent = {
    contentVersion: siteContentSchemaVersion,
    initiatives: mergeInitiatives(input.initiatives || existing.initiatives),
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

function replaceLegacySetuAiArtwork(
  content: EditableSiteContent,
): EditableSiteContent {
  if (content.home.heartbeat.image.src !== "/images/skypa-higgsfield-heart.png")
    return content;

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

export async function saveMediaUpload(
  input: Omit<CmsMediaUpload, "createdAt">,
) {
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

const submissionRecordsKey = `${keys.submissions}:records`;

export async function getSubmissions() {
  const client = redis();
  if (!client) return [];
  // Read failures must be visible: silently treating an outage as an empty
  // collection could otherwise erase existing submissions during an update.
  const [legacy, records] = await Promise.all([
    client.get<CmsSubmission[]>(keys.submissions),
    client.hgetall<Record<string, CmsSubmission>>(submissionRecordsKey),
  ]);
  const byId = new Map(
    (parseStored<CmsSubmission[]>(legacy) || []).map((item) => [item.id, item]),
  );
  for (const item of Object.values(records || {})) {
    const parsed = parseStored<CmsSubmission>(item);
    if (parsed) byId.set(parsed.id, parsed);
  }
  return [...byId.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function saveSubmission(
  input: Omit<CmsSubmission, "id" | "createdAt" | "read">,
  fingerprint?: string,
) {
  const client = redis();
  if (!client) throw new Error("Upstash is not configured.");
  const submission: CmsSubmission = {
    id: fingerprint ? `inquiry-${fingerprint}` : randomUUID(),
    ...input,
    createdAt: now(),
    read: false,
  };
  const created = await client.hsetnx(
    submissionRecordsKey,
    submission.id,
    submission,
  );
  if (!created) {
    const existing = parseStored<CmsSubmission>(
      await client.hget(submissionRecordsKey, submission.id),
    );
    if (!existing) throw new Error("Unable to load the saved submission.");
    return { submission: existing, duplicate: true };
  }
  return { submission, duplicate: false };
}

export async function getSubmission(id: string) {
  const client = redis();
  if (!client) throw new Error("Upstash is not configured.");
  const entry = parseStored<CmsSubmission>(
    await client.hget(submissionRecordsKey, id),
  );
  return (
    entry || (await getSubmissions()).find((item) => item.id === id) || null
  );
}

export async function markSubmissionRead(id: string) {
  return updateSubmission(id, { read: true });
}

export async function updateSubmission(
  id: string,
  input: Partial<
    Pick<
      CmsSubmission,
      | "status"
      | "assignedTo"
      | "notes"
      | "read"
      | "notificationStatus"
      | "notificationError"
      | "notifiedAt"
      | "providerMessageId"
    >
  >,
) {
  const client = redis();
  if (!client) throw new Error("Upstash is not configured.");
  const existing = await getSubmission(id);
  if (!existing) return null;
  const next = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(input).filter(([, value]) => value !== undefined),
    ),
  };
  await client.hset(submissionRecordsKey, { [id]: next });
  return next;
}

export async function acquireNotificationLock(id: string) {
  const client = redis();
  if (!client) throw new Error("Upstash is not configured.");
  const token = randomUUID();
  const acquired = await client.set(
    `${keys.submissions}:notification-lock:${id}`,
    token,
    { nx: true, ex: 120 },
  );
  return acquired ? token : null;
}
export async function releaseNotificationLock(id: string, token: string) {
  const client = redis();
  if (!client) return;
  await client.eval(
    "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end",
    [`${keys.submissions}:notification-lock:${id}`],
    [token],
  );
}

export async function getSubscribers() {
  return readCollection<CmsSubscriber>(keys.subscribers, []);
}

export async function saveSubscriber(
  input: Omit<
    CmsSubscriber,
    "id" | "createdAt" | "updatedAt" | "active" | "unsubscribeTokenHash"
  > & {
    active?: boolean;
    unsubscribeTokenHash?: string;
  },
) {
  const subscribers = await getSubscribers();
  const normalizedEmail = input.email.trim().toLowerCase();
  const existing = subscribers.find(
    (subscriber) => subscriber.email === normalizedEmail,
  );
  const subscriber: CmsSubscriber = {
    id: existing?.id || crypto.randomUUID(),
    email: normalizedEmail,
    name: input.name || existing?.name || "",
    source: input.source || existing?.source || "updates-page",
    active: input.active ?? true,
    confirmedAt: input.confirmedAt ?? existing?.confirmedAt,
    consentAt: input.consentAt ?? existing?.consentAt,
    confirmationTokenHash:
      input.confirmationTokenHash ?? existing?.confirmationTokenHash,
    unsubscribeTokenHash:
      input.unsubscribeTokenHash ||
      existing?.unsubscribeTokenHash ||
      tokenHash(randomUUID()),
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };
  await writeCollection(keys.subscribers, [
    subscriber,
    ...subscribers.filter((item) => item.id !== subscriber.id),
  ]);
  return subscriber;
}

export async function createPendingSubscriber(input: {
  email: string;
  name?: string;
  source: string;
}) {
  const subscribers = await getSubscribers();
  const email = input.email.trim().toLowerCase();
  const existing = subscribers.find((subscriber) => subscriber.email === email);

  if (existing?.active && existing.confirmedAt) {
    return {
      subscriber: existing,
      confirmationToken: null,
      unsubscribeToken: null,
      alreadyConfirmed: true,
    };
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
    unsubscribeTokenHash:
      existing?.unsubscribeTokenHash || tokenHash(unsubscribeToken),
    createdAt: existing?.createdAt || now(),
    updatedAt: now(),
  };

  await writeCollection(keys.subscribers, [
    subscriber,
    ...subscribers.filter((item) => item.id !== subscriber.id),
  ]);
  return {
    subscriber,
    confirmationToken,
    unsubscribeToken,
    alreadyConfirmed: false,
  };
}

export async function confirmSubscriber(token: string) {
  const subscribers = await getSubscribers();
  const tokenDigest = tokenHash(token);
  const existing = subscribers.find(
    (subscriber) => subscriber.confirmationTokenHash === tokenDigest,
  );
  if (!existing) return null;

  const subscriber: CmsSubscriber = {
    ...existing,
    active: true,
    confirmedAt: now(),
    confirmationTokenHash: undefined,
    updatedAt: now(),
  };
  await writeCollection(keys.subscribers, [
    subscriber,
    ...subscribers.filter((item) => item.id !== subscriber.id),
  ]);
  return subscriber;
}

export async function unsubscribeSubscriber(token: string) {
  const subscribers = await getSubscribers();
  const tokenDigest = tokenHash(token);
  const existing = subscribers.find(
    (subscriber) => subscriber.unsubscribeTokenHash === tokenDigest,
  );
  if (!existing) return null;

  const subscriber: CmsSubscriber = {
    ...existing,
    active: false,
    updatedAt: now(),
  };
  await writeCollection(keys.subscribers, [
    subscriber,
    ...subscribers.filter((item) => item.id !== subscriber.id),
  ]);
  return subscriber;
}

export async function createUnsubscribeToken(subscriberId: string) {
  const subscribers = await getSubscribers();
  const existing = subscribers.find(
    (subscriber) => subscriber.id === subscriberId,
  );
  if (!existing) return null;

  const token = randomUUID();
  const subscriber: CmsSubscriber = {
    ...existing,
    unsubscribeTokenHash: tokenHash(token),
    updatedAt: now(),
  };
  await writeCollection(keys.subscribers, [
    subscriber,
    ...subscribers.filter((item) => item.id !== subscriber.id),
  ]);
  return token;
}

export async function getDashboardSummary() {
  const [posts, pages, programEntries, albums, submissions, subscribers] =
    await Promise.all([
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
      publishedPosts: posts.filter((post) => post.status === "published")
        .length,
      drafts: posts.filter((post) => post.status === "draft").length,
      pages: pages.length,
      programs: programEntries.length,
      albums: albums.length,
      unreadMessages: submissions.filter((submission) => !submission.read)
        .length,
      subscribers: subscribers.filter((subscriber) => subscriber.active).length,
    },
  };
}
