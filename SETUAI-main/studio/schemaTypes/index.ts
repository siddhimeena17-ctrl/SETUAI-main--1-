import { defineArrayMember, defineField, defineType } from "sanity";

const seoFields = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  fields: [
    defineField({ name: "title", title: "SEO title", type: "string" }),
    defineField({ name: "description", title: "Meta description", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Social image", type: "image", options: { hotspot: true } }),
    defineField({ name: "noIndex", title: "No index", type: "boolean", initialValue: false }),
  ],
});

const ctaFields = defineType({
  name: "cta",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "href", title: "URL", type: "string", validation: (Rule) => Rule.required() }),
    defineField({
      name: "variant",
      title: "Variant",
      type: "string",
      options: {
        list: [
          { title: "Primary", value: "primary" },
          { title: "Secondary", value: "secondary" },
          { title: "Light", value: "light" },
        ],
      },
      initialValue: "primary",
    }),
  ],
});

const navItem = defineType({
  name: "navItem",
  title: "Navigation item",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "href", title: "URL", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({
      name: "children",
      title: "Dropdown children",
      type: "array",
      of: [defineArrayMember({ type: "navItem" })],
    }),
  ],
});

const stat = defineType({
  name: "impactStat",
  title: "Impact stat",
  type: "document",
  fields: [
    defineField({ name: "value", title: "Value", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "label", title: "Label", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "detail", title: "Detail", type: "text", rows: 3 }),
    defineField({ name: "sortOrder", title: "Sort order", type: "number" }),
  ],
  preview: {
    select: { title: "value", subtitle: "label" },
  },
});

const card = defineType({
  name: "card",
  title: "Card",
  type: "object",
  fields: [
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "body", title: "Body", type: "text", rows: 4 }),
    defineField({ name: "href", title: "Link", type: "string" }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      options: {
        list: ["book", "building", "check", "heart", "lightbulb", "map", "message", "school", "shield", "sparkles", "students", "users"],
      },
    }),
  ],
});

const pageSection = defineType({
  name: "pageSection",
  title: "Page section",
  type: "object",
  fields: [
    defineField({
      name: "type",
      title: "Section type",
      type: "string",
      validation: (Rule) => Rule.required(),
      options: {
        list: [
          { title: "Text", value: "text" },
          { title: "Cards", value: "cards" },
          { title: "Steps", value: "steps" },
          { title: "Image split", value: "image" },
          { title: "FAQ", value: "faq" },
          { title: "CTA band", value: "cta" },
        ],
      },
    }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "body", title: "Body", type: "array", of: [defineArrayMember({ type: "text" })] }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Image alt text", type: "string" }),
    defineField({ name: "cta", title: "Single CTA", type: "cta" }),
    defineField({ name: "ctas", title: "CTA buttons", type: "array", of: [defineArrayMember({ type: "cta" })] }),
    defineField({ name: "cards", title: "Cards", type: "array", of: [defineArrayMember({ type: "card" })] }),
    defineField({
      name: "steps",
      title: "Steps",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "body", title: "Body", type: "text", rows: 3 }),
          ],
        }),
      ],
    }),
    defineField({
      name: "faqs",
      title: "FAQs",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "question", title: "Question", type: "string" }),
            defineField({ name: "answer", title: "Answer", type: "text", rows: 4 }),
          ],
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "type" },
  },
});

const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Site title", type: "string", initialValue: "SetuAI" }),
    defineField({ name: "tagline", title: "Tagline", type: "string" }),
    defineField({ name: "announcement", title: "Announcement", type: "text", rows: 2 }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "cta" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
    defineField({ name: "headerNavigation", title: "Header navigation", type: "array", of: [defineArrayMember({ type: "navItem" })] }),
    defineField({
      name: "footerColumns",
      title: "Footer columns",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          fields: [
            defineField({ name: "title", title: "Title", type: "string" }),
            defineField({ name: "links", title: "Links", type: "array", of: [defineArrayMember({ type: "navItem" })] }),
          ],
        }),
      ],
    }),
    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo" }),
  ],
});

const sitePage = defineType({
  name: "sitePage",
  title: "Site page",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "description", title: "SEO description", type: "text", rows: 3 }),
    defineField({ name: "heroImage", title: "Hero image", type: "image", options: { hotspot: true } }),
    defineField({ name: "heroImageAlt", title: "Hero image alt text", type: "string" }),
    defineField({ name: "primaryCta", title: "Primary CTA", type: "cta" }),
    defineField({ name: "secondaryCta", title: "Secondary CTA", type: "cta" }),
    defineField({ name: "sections", title: "Sections", type: "array", of: [defineArrayMember({ type: "pageSection" })] }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "slug.current" },
  },
});

const program = defineType({
  name: "program",
  title: "Program",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "audience", title: "Audience", type: "string" }),
    defineField({ name: "length", title: "Length or format", type: "string" }),
    defineField({ name: "outcomes", title: "Learning outcomes", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "modules", title: "Modules", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "sections", title: "Sections", type: "array", of: [defineArrayMember({ type: "pageSection" })] }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
});

const story = defineType({
  name: "story",
  title: "Story",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "eyebrow", title: "Eyebrow", type: "string" }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Image alt text", type: "string" }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [defineArrayMember({ type: "string" })] }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
});

const update = defineType({
  name: "update",
  title: "Update",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Blog", value: "blog" },
          { title: "Event", value: "event" },
          { title: "Announcement", value: "announcement" },
          { title: "Textbook", value: "textbook" },
          { title: "Program", value: "program" },
        ],
      },
      initialValue: "blog",
    }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3, validation: (Rule) => Rule.required() }),
    defineField({ name: "publishedAt", title: "Published at", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({ name: "image", title: "Image", type: "image", options: { hotspot: true } }),
    defineField({ name: "imageAlt", title: "Image alt text", type: "string" }),
    defineField({
      name: "body",
      title: "Body",
      type: "array",
      of: [
        defineArrayMember({ type: "block" }),
        defineArrayMember({ type: "image", options: { hotspot: true } }),
      ],
    }),
    defineField({ name: "sendEmail", title: "Send email notification", type: "boolean", initialValue: true }),
    defineField({ name: "emailSubject", title: "Email subject override", type: "string" }),
    defineField({
      name: "notificationStatus",
      title: "Notification status",
      type: "string",
      readOnly: true,
      options: {
        list: [
          { title: "Not sent", value: "not-sent" },
          { title: "Sent", value: "sent" },
          { title: "Failed", value: "failed" },
        ],
      },
      initialValue: "not-sent",
    }),
    defineField({ name: "lastNotificationSentAt", title: "Last notification sent at", type: "datetime", readOnly: true }),
    defineField({ name: "recipientCount", title: "Recipient count", type: "number", readOnly: true }),
    defineField({ name: "notificationError", title: "Notification error", type: "text", rows: 3, readOnly: true }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "image" },
  },
});

const resource = defineType({
  name: "resource",
  title: "Resource",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "slug", title: "Slug", type: "slug", options: { source: "title" }, validation: (Rule) => Rule.required() }),
    defineField({ name: "type", title: "Resource type", type: "string" }),
    defineField({ name: "audience", title: "Audience", type: "string" }),
    defineField({ name: "minutes", title: "Read time", type: "string" }),
    defineField({ name: "summary", title: "Summary", type: "text", rows: 3 }),
    defineField({ name: "body", title: "Body", type: "array", of: [defineArrayMember({ type: "block" })] }),
    defineField({ name: "file", title: "Download file", type: "file" }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
});

const partner = defineType({
  name: "partner",
  title: "Partner",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "type", title: "Partner type", type: "string", options: { list: ["School", "Company", "Nonprofit", "Library", "Community"] } }),
    defineField({ name: "logo", title: "Logo", type: "image" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 3 }),
    defineField({ name: "url", title: "URL", type: "url" }),
    defineField({ name: "featured", title: "Featured", type: "boolean", initialValue: false }),
  ],
});

const formSubmission = defineType({
  name: "formSubmission",
  title: "Form submission",
  type: "document",
  readOnly: true,
  fields: [
    defineField({ name: "formType", title: "Form type", type: "string" }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "organization", title: "Organization", type: "string" }),
    defineField({ name: "interest", title: "Interest", type: "string" }),
    defineField({ name: "message", title: "Message", type: "text", rows: 5 }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime" }),
  ],
  preview: {
    select: { title: "name", subtitle: "formType" },
  },
});

const subscriber = defineType({
  name: "subscriber",
  title: "Subscriber",
  type: "document",
  fields: [
    defineField({ name: "email", title: "Email", type: "string", validation: (Rule) => Rule.required().email() }),
    defineField({ name: "name", title: "Name", type: "string" }),
    defineField({
      name: "source",
      title: "Source",
      type: "string",
      options: {
        list: ["form", "updates-page", "school", "volunteer", "sponsor", "manual"],
      },
      initialValue: "updates-page",
    }),
    defineField({ name: "active", title: "Active", type: "boolean", initialValue: true }),
    defineField({ name: "createdAt", title: "Created at", type: "datetime", initialValue: () => new Date().toISOString() }),
    defineField({ name: "updatedAt", title: "Updated at", type: "datetime", readOnly: true }),
    defineField({ name: "unsubscribedAt", title: "Unsubscribed at", type: "datetime", readOnly: true }),
  ],
  preview: {
    select: { title: "email", subtitle: "source" },
  },
});

const chatbotKnowledge = defineType({
  name: "chatbotKnowledge",
  title: "Chatbot knowledge",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (Rule) => Rule.required() }),
    defineField({ name: "answer", title: "Approved answer or fact", type: "text", rows: 6, validation: (Rule) => Rule.required() }),
    defineField({ name: "topic", title: "Topic", type: "string" }),
    defineField({ name: "active", title: "Active", type: "boolean", initialValue: true }),
  ],
});

export const schemaTypes = [
  seoFields,
  ctaFields,
  navItem,
  card,
  pageSection,
  siteSettings,
  sitePage,
  program,
  story,
  update,
  resource,
  partner,
  stat,
  formSubmission,
  subscriber,
  chatbotKnowledge,
];
