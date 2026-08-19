export const apiVersion = "2026-07-08";
export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "c243kj7a";

// The Studio remains a separate editorial workspace. The public site uses the
// custom admin and Upstash as its source of truth unless an operator explicitly
// opts into Sanity delivery after its dataset has been reviewed and populated.
export const isSanityConfigured =
  process.env.SANITY_CONTENT_ENABLED === "true" && Boolean(projectId && dataset);
