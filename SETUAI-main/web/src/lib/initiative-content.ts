import {
  defaultInitiatives,
  newPartner,
  newRecommendation,
  type InitiativeContent,
} from "@/content/initiatives";

export function safeContentUrl(value: string) {
  if (!value) return true;
  if (/^\/(?!\/)/.test(value)) return !/[\s\\]/.test(value);
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password
    );
  } catch {
    return false;
  }
}

// Merge missing fields, but preserve deliberately empty arrays and draft entries.
export function mergeInitiatives(input: unknown): InitiativeContent {
  function merge(base: unknown, value: unknown, key = ""): unknown {
    if (Array.isArray(base)) {
      if (!Array.isArray(value)) return structuredClone(base);
      const template =
        key === "recommendations"
          ? newRecommendation
          : key === "partners"
            ? newPartner
            : base[0];
      return value.slice(0, 150).map((item) => merge(template, item));
    }
    if (base && typeof base === "object") {
      const record =
        value && typeof value === "object" && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {};
      return Object.fromEntries(
        Object.entries(base).map(([name, entry]) => [
          name,
          merge(entry, record[name], name),
        ]),
      );
    }
    if (typeof value !== typeof base) return base;
    if (typeof value === "string") return value.slice(0, 20000);
    if (typeof value === "number") return Number.isFinite(value) ? value : base;
    return value;
  }
  return merge(defaultInitiatives, input) as InitiativeContent;
}

export function validateInitiatives(content: InitiativeContent) {
  const errors: string[] = [];
  function inspect(value: unknown, path: string) {
    if (Array.isArray(value))
      return value.forEach((item, index) => inspect(item, `${path}.${index}`));
    if (!value || typeof value !== "object") return;
    for (const [key, item] of Object.entries(value)) {
      if (
        ["website", "logo", "letterUrl", "sampleUrl", "url", "image"].includes(
          key,
        ) &&
        typeof item === "string" &&
        !safeContentUrl(item)
      )
        errors.push(`${path}.${key}: use a relative path or HTTPS URL`);
      inspect(item, `${path}.${key}`);
    }
  }
  inspect(content, "initiatives");
  for (const item of [...content.recommendations, ...content.partners]) {
    if (
      !["draft", "published"].includes(item.status) ||
      !["pending", "approved"].includes(item.approval)
    )
      errors.push("Choose a valid publication and approval status.");
  }
  for (const item of content.recommendations) {
    if (
      item.status === "published" &&
      item.approval === "approved" &&
      (!item.organization.trim() || !item.excerpt.trim() || !item.scope.trim())
    )
      errors.push(
        "Published recommendations need an organization, exact excerpt, and scope.",
      );
    if (item.date && !/^\d{4}-\d{2}-\d{2}$/.test(item.date))
      errors.push("Letter dates must use YYYY-MM-DD or be empty.");
  }
  if (
    new Set(content.recommendations.map((item) => item.id)).size !==
    content.recommendations.length
  )
    errors.push("Recommendation IDs must be unique.");
  if (
    new Set(content.partners.map((item) => item.id)).size !==
    content.partners.length
  )
    errors.push("Partner IDs must be unique.");
  const allowed = defaultInitiatives.homeOrder;
  if (
    content.homeOrder.length !== allowed.length ||
    new Set(content.homeOrder).size !== allowed.length ||
    content.homeOrder.some((id) => !allowed.includes(id))
  )
    errors.push("Homepage order must contain every section exactly once.");
  return errors;
}

// Public responses and client props must never serialize drafts or internal
// provenance fields from the protected editor.
export function publicSiteContent<T extends { initiatives: InitiativeContent }>(
  content: T,
): T {
  return {
    ...content,
    initiatives: {
      ...content.initiatives,
      recommendations: content.initiatives.recommendations
        .filter(
          (item) => item.status === "published" && item.approval === "approved",
        )
        .map((item) => ({ ...item, sourceDocument: "" })),
      partners: content.initiatives.partners.filter(
        (item) => item.status === "published" && item.approval === "approved",
      ),
    },
  };
}
