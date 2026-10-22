export type FormType =
  | "school"
  | "nonprofit"
  | "volunteer"
  | "sponsor"
  | "contact"
  | "chapter"
  | "textbook"
  | "beta";
export type FormField = {
  name: string;
  label: string;
  required?: boolean;
  kind?: "text" | "email" | "textarea" | "select" | "number";
  options?: string[];
  max?: number;
};
const common: FormField[] = [
  { name: "name", label: "Name", required: true, max: 120 },
  { name: "email", label: "Email", kind: "email", required: true, max: 160 },
  { name: "organization", label: "School or organization", max: 160 },
];
const interests: Record<Exclude<FormType, "chapter" | "beta">, string[]> = {
  school: [
    "School workshop",
    "Textbook inquiry",
    "Teacher training",
    "Parent night",
  ],
  nonprofit: [
    "Community learning",
    "Textbook adoption",
    "Educational partnership",
    "General question",
  ],
  volunteer: [
    "Workshop support",
    "Curriculum review",
    "Outreach",
    "Operations",
  ],
  sponsor: [
    "Textbook sponsorship",
    "School pilot",
    "Corporate volunteering",
    "General support",
  ],
  contact: [
    "School partnership",
    "Nonprofit partnership",
    "Volunteer",
    "Sponsor",
    "General question",
  ],
  textbook: [
    "Request a sample",
    "Publication updates interest",
    "School or organizational adoption",
    "General textbook question",
  ],
};
export function fieldsFor(formType: FormType): FormField[] {
  if (formType === "chapter")
    return [
      ...common.map((field) =>
        field.name === "organization" ? { ...field, required: true } : field,
      ),
      { name: "city", label: "City", required: true, max: 100 },
      { name: "country", label: "Country", required: true, max: 100 },
      {
        name: "setting",
        label: "Proposed chapter setting",
        required: true,
        kind: "select",
        options: ["School", "College", "Community"],
      },
      {
        name: "motivation",
        label: "Why would you like to start a chapter?",
        required: true,
        kind: "textarea",
        max: 2000,
      },
      {
        name: "experience",
        label: "Leadership or teaching experience (optional)",
        kind: "textarea",
        max: 1500,
      },
      {
        name: "activities",
        label: "Proposed activities",
        required: true,
        kind: "textarea",
        max: 1500,
      },
      {
        name: "participants",
        label: "Estimated initial participation (optional)",
        kind: "number",
        max: 6,
      },
      {
        name: "message",
        label: "Questions (optional)",
        kind: "textarea",
        max: 2000,
      },
    ];
  if (formType === "beta")
    return [
      ...common,
      {
        name: "role",
        label: "Your role or intended use",
        required: true,
        max: 200,
      },
      {
        name: "participation",
        label: "How would you like to participate?",
        kind: "select",
        required: true,
        options: ["Individual", "Chapter", "Both"],
      },
      {
        name: "message",
        label: "What would you like to test or share feedback on? (optional)",
        kind: "textarea",
        max: 2000,
      },
    ];
  return [
    ...common,
    {
      name: "interest",
      label: "Interest",
      required: true,
      kind: "select",
      options: interests[formType],
    },
    {
      name: "message",
      label: "Message",
      required: true,
      kind: "textarea",
      max: 2000,
    },
  ];
}
export const formTypes: FormType[] = [
  "school",
  "nonprofit",
  "volunteer",
  "sponsor",
  "contact",
  "chapter",
  "textbook",
  "beta",
];
