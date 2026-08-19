import { Resend } from "resend";
import { createUnsubscribeToken, getSubscribers, savePost, type CmsPost } from "@/lib/cms";
import { absoluteUrl } from "@/lib/utils";
import { siteConfig } from "@/content/site";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function configuration() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.UPDATES_FROM_EMAIL;
  return apiKey && from ? { apiKey, from } : null;
}

function emailContent(update: Pick<CmsPost, "title" | "slug" | "summary" | "body">, unsubscribeUrl: string) {
  const updateUrl = absoluteUrl(`/updates/${update.slug}`);
  const subject = `${siteConfig.shortName} update: ${update.title}`;
  const paragraphs = [update.summary, ...(update.body || [])].filter(Boolean).slice(0, 4);
  const html = [
    `<h1>${escapeHtml(update.title)}</h1>`,
    ...paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`),
    `<p><a href="${updateUrl}">Read the full update</a></p>`,
    `<p style="font-size:12px;color:#555">You are receiving this because you confirmed a SetuAI updates subscription. <a href="${unsubscribeUrl}">Unsubscribe</a>.</p>`,
  ].join("");
  const text = `${update.title}\n\n${paragraphs.join("\n\n")}\n\nRead more: ${updateUrl}\n\nUnsubscribe: ${unsubscribeUrl}`;
  return { subject, html, text };
}

async function mapWithConcurrency<T, R>(items: T[], limit: number, task: (item: T) => Promise<R>) {
  const results: PromiseSettledResult<R>[] = [];
  let cursor = 0;

  async function worker() {
    while (cursor < items.length) {
      const item = items[cursor];
      cursor += 1;
      try {
        results.push({ status: "fulfilled", value: await task(item) });
      } catch (reason) {
        results.push({ status: "rejected", reason });
      }
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()));
  return results;
}

export async function sendPublishedUpdateEmail(update: CmsPost) {
  if (update.status !== "published") return { ok: false, error: "Only published updates can be emailed." } as const;

  const mail = configuration();
  if (!mail) {
    await savePost({ ...update, notificationStatus: "failed" });
    return { ok: false, error: "Resend and UPDATES_FROM_EMAIL must be configured before sending update email." } as const;
  }

  const subscribers = (await getSubscribers()).filter((subscriber) => subscriber.active && Boolean(subscriber.confirmedAt));
  if (!subscribers.length) return { ok: true, attempted: 0, sent: 0, failed: 0 } as const;

  const resend = new Resend(mail.apiKey);
  const results = await mapWithConcurrency(subscribers, 10, async (subscriber) => {
    const token = await createUnsubscribeToken(subscriber.id);
    if (!token) throw new Error("Unable to create unsubscribe token");
    const unsubscribeUrl = absoluteUrl(`/api/updates/unsubscribe?token=${encodeURIComponent(token)}`);
    const message = emailContent(update, unsubscribeUrl);
    return resend.emails.send({ from: mail.from, to: subscriber.email, ...message });
  });
  const failed = results.filter((result) => result.status === "rejected").length;

  await savePost({ ...update, notificationStatus: failed ? "failed" : "sent" });
  return { ok: failed === 0, attempted: subscribers.length, sent: subscribers.length - failed, failed } as const;
}
