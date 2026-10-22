import type { CmsSubmission } from "@/lib/cms";

export function inquirySubject(
  input: Pick<CmsSubmission, "formType" | "organization" | "name">,
) {
  const labels: Record<string, string> = {
    chapter: "Chapter Application",
    beta: "Platform Beta",
    textbook: "Textbook Inquiry",
    school: "School Inquiry",
    nonprofit: "Nonprofit Inquiry",
    volunteer: "Volunteer Inquiry",
    sponsor: "Sponsorship Inquiry",
    contact: "Contact",
  };
  return `[SetuAI ${labels[input.formType] || "Inquiry"}] ${input.formType === "textbook" ? input.organization || input.name : input.name}${input.formType === "chapter" && input.organization ? ` — ${input.organization}` : ""}`;
}
