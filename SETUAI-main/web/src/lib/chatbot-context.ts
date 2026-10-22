import type { EditableSiteContent } from "@/content/editable-site";
import {
  publishedPartners,
  publishedRecommendations,
} from "@/content/initiatives";
export function currentChatbotFacts({
  initiatives: work,
}: EditableSiteContent) {
  return [
    `${work.impact.value} ${work.impact.label}. ${work.impact.sourceNote}`,
    `Textbook: ${work.textbook.title}. Status: ${work.textbook.status}. Audience: ${work.textbook.audience}. Topics: ${work.textbook.topics.join("; ")}. Inquiries: /textbook#inquiry.`,
    `Chapter applications are ${work.chapters.applicationsOpen ? "open" : "paused"}. ${work.chapters.overview} Support: ${work.chapters.support.join("; ")}. Applications require review; submitting does not imply acceptance. Page: /chapters.`,
    `Platform beta registration is ${work.platform.betaOpen ? "open" : "paused"}. ${work.platform.overview} ${work.platform.collaboration} ${work.platform.url ? `Approved platform URL: ${work.platform.url}.` : "Use /platform#beta to register interest; this does not give immediate access."}`,
    `Recommendation context: ${work.recommendationContext} Published organizations: ${publishedRecommendations(
      work,
    )
      .map((item) => item.organization)
      .join(", ")}. Read /recommendations.`,
    `Published partnerships: ${publishedPartners(work)
      .map(
        (partner) => `${partner.name}: ${partner.category}, ${partner.scope}`,
      )
      .join("; ")}.`,
    "Contact setuai.edu@gmail.com or /contact. No purchase, immediate chapter approval, or unlisted platform features should be promised.",
  ];
}
