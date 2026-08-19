export type LinkItem = {
  label: string;
  href: string;
  description?: string;
  children?: LinkItem[];
};

export type Cta = {
  label: string;
  href: string;
  variant?: "primary" | "secondary" | "light";
};

export type Stat = {
  value: string;
  label: string;
  detail: string;
};

export type Card = {
  eyebrow?: string;
  title: string;
  body: string;
  href?: string;
  icon?: string;
};

export type Step = {
  title: string;
  body: string;
};

export type Faq = {
  question: string;
  answer: string;
};

export type PageSection =
  | { type: "text"; eyebrow?: string; title: string; body: string[]; cta?: Cta }
  | { type: "cards"; eyebrow?: string; title: string; body?: string; cards: Card[] }
  | { type: "steps"; eyebrow?: string; title: string; body?: string; steps: Step[] }
  | { type: "image"; eyebrow?: string; title: string; body: string; image: string; imageAlt: string; cta?: Cta }
  | { type: "faq"; eyebrow?: string; title: string; faqs: Faq[] }
  | { type: "cta"; eyebrow?: string; title: string; body: string; ctas: Cta[] };

export type SitePage = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  description: string;
  image?: string;
  imageAlt?: string;
  cta?: Cta;
  secondaryCta?: Cta;
  sections: PageSection[];
};

export type Program = SitePage & {
  audience: string;
  length: string;
  outcomes: string[];
  modules: string[];
};

export type Story = {
  slug: string;
  title: string;
  eyebrow: string;
  summary: string;
  body: string[];
  image: string;
  imageAlt: string;
  tags: string[];
};

export type Resource = {
  slug: string;
  title: string;
  type: string;
  summary: string;
  audience: string;
  minutes: string;
  body: string[];
};

export type Update = {
  slug: string;
  title: string;
  category: "blog" | "event" | "announcement" | "textbook" | "program";
  summary: string;
  publishedAt: string;
  body: string[];
  image?: string;
  imageAlt?: string;
};

export type Initiative = SitePage & {
  region?: string;
  focus: string;
};

export const siteConfig = {
  name: "SetuAI",
  shortName: "SetuAI",
  tagline: "Practical AI literacy for schools and communities.",
  description:
    "SetuAI is an active AI literacy initiative convened by Summit Intelligent Systems, Shikivaa Foundation, and SKYPA Foundation. We build practical, responsible AI learning pathways with schools, education nonprofits, and community partners.",
  url: "https://setuai.org",
  email: "hello@setuai.org",
  image: "/images/skypa-hero-classroom.png",
};

export const foundingPartners = [
  {
    name: "Summit Intelligent Systems",
    href: "https://summitintelligentsystems.com/",
    role: "Technology and implementation partner",
    body: "Summit contributes product, systems, and implementation experience to the founding collaboration.",
  },
  {
    name: "Shikivaa Foundation",
    href: "https://www.shikvaafoundation.org/",
    role: "Education and community access partner",
    body: "Shikivaa contributes an education-first perspective and community access experience to the founding collaboration.",
  },
  {
    name: "SKYPA Foundation",
    href: "/about#founding-partners",
    role: "AI literacy initiative partner",
    body: "SKYPA contributes the originating AI literacy, textbook, school outreach, and volunteer vision behind SetuAI.",
  },
] as const;

export const headerNav: LinkItem[] = [
  { label: "About", href: "/about" },
  {
    label: "For partners",
    href: "/partners",
    children: [
      { label: "Schools", href: "/schools", description: "Start a practical partnership conversation." },
      { label: "Education nonprofits", href: "/partners", description: "Explore a community learning collaboration." },
      { label: "Sponsors", href: "/contact?interest=sponsor", description: "Discuss active material and partnership support." },
    ],
  },
  { label: "Textbook", href: "/textbook" },
  { label: "Updates", href: "/updates" },
  { label: "Get involved", href: "/get-involved" },
];

export const footerColumns: { title: string; links: LinkItem[] }[] = [
  {
    title: "SetuAI",
    links: [
      { label: "About", href: "/about" },
      { label: "How we measure", href: "/impact" },
      { label: "Textbook initiative", href: "/textbook" },
      { label: "Updates", href: "/updates" },
    ],
  },
  {
    title: "Work with us",
    links: [
      { label: "For schools", href: "/schools" },
      { label: "For education nonprofits", href: "/partners" },
      { label: "Sponsor interest", href: "/contact?interest=sponsor" },
      { label: "Volunteer interest", href: "/contact?interest=volunteer" },
    ],
  },
  {
    title: "Care and trust",
    links: [
      { label: "Privacy and data use", href: "/privacy" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Safeguarding approach", href: "/safeguarding" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export const impactStats: Stat[] = [
  {
    value: "Launched",
    label: "Organization status",
    detail:
      "SetuAI is now operating as an independent initiative focused on practical AI literacy, education, and building.",
  },
  {
    value: "Ready",
    label: "Textbook and learning materials",
    detail:
      "The student-facing AI textbook and supporting learning materials have been developed, reviewed, and are ready for implementation.",
  },
  {
    value: "Active",
    label: "Partnerships and programs",
    detail:
      "SetuAI is actively working with schools, educators, nonprofits, and community partners to bring practical AI learning to more learners.",
  },
  {
    value: "Builder-first",
    label: "Design principle",
    detail:
      "We focus on practical understanding, responsible use, experimentation, and the confidence to build with AI.",
  },
];

export const homePillars: Card[] = [
  {
    title: "Build understanding before dependence",
    body: "Young people deserve plain-language ways to understand what AI does, where it appears, and when to question it.",
    href: "/about",
    icon: "lightbulb",
  },
  {
    title: "Design with schools, not around them",
    body: "Our programs fit real school schedules, adult supervision, local policy, and family communication.",
    href: "/schools",
    icon: "school",
  },
  {
    title: "Make durable materials",
    body: "The textbook initiative is a practical, reviewable learning resource that continues to improve with use and feedback.",
    href: "/textbook",
    icon: "book",
  },
];

const corePagesBase: SitePage[] = [
  {
    slug: "about",
    title: "About SetuAI",
    eyebrow: "Active initiative",
    summary: "SetuAI is an active AI literacy initiative building practical learning with schools, educators, and community partners.",
    description: "Learn about SetuAI, an active AI literacy initiative convened by Summit Intelligent Systems, Shikivaa Foundation, and SKYPA Foundation.",
    image: "/images/skypa-partnership-workshop.png",
    imageAlt: "Concept image representing a collaborative AI learning workshop.",
    cta: { label: "Start a conversation", href: "/contact" },
    secondaryCta: { label: "Meet the founding partners", href: "/partners", variant: "secondary" },
    sections: [
      {
        type: "text",
        title: "A bridge into practical AI literacy.",
        body: [
          "SetuAI is an active initiative convened by Summit Intelligent Systems, Shikivaa Foundation, and SKYPA Foundation around a shared question: how can schools and communities help young people understand AI before it becomes invisible in their daily lives?",
          "We work through practical materials, careful review, and direct collaboration with educators and community partners. Our approach is grounded in clear learning design, accessibility, safeguarding, and ongoing improvement.",
        ],
      },
      {
        type: "cards",
        title: "What SetuAI is building toward.",
        body: "The focus is practical learning, not inflated promises. Every offer is reviewed, age-appropriate, and clear about the work it supports.",
        cards: [
          { title: "AI literacy", body: "Plain-language learning about AI systems, outputs, privacy, bias, verification, and human judgment.", icon: "lightbulb" },
          { title: "School collaboration", body: "Working with educators and youth-serving organizations to shape practical learning and appropriate next steps.", icon: "school" },
          { title: "Student materials", body: "Textbook and supporting resources that are reviewed, improved, and made useful over time.", icon: "book" },
        ],
      },
      {
        type: "text",
        eyebrow: "Founding collaboration",
        title: "Three partners, one shared starting point.",
        body: [
          "Summit Intelligent Systems contributes technology and implementation experience. Shikivaa Foundation contributes an education-first and community-access perspective. SKYPA Foundation contributes the originating AI literacy, textbook, school outreach, and volunteer vision.",
          "Founding partners support SetuAI's work and continue to shape the initiative alongside educators, community partners, and practical review processes. Public claims remain grounded in what is actively happening and what is clearly documented.",
        ],
      },
    ],
  },
  {
    slug: "textbook",
    title: "The SetuAI Textbook Initiative",
    eyebrow: "Active materials",
    summary: "SetuAI builds practical, classroom-ready AI literacy materials and keeps improving them through review and implementation.",
    description: "Explore SetuAI's AI literacy textbook initiative and the process used to develop, review, validate, release, and improve classroom-ready materials.",
    image: "/images/skypa-ai-textbook.png",
    imageAlt: "Concept image of AI literacy workbook materials.",
    cta: { label: "Discuss textbook support", href: "/contact?interest=sponsor" },
    secondaryCta: { label: "See the approach", href: "/about", variant: "secondary" },
    sections: [
      {
        type: "image",
        title: "A durable learning resource, built carefully.",
        body: "SetuAI develops and reviews the textbook as a practical learning resource. The process includes manuscript review, human-centered design, accessibility checks, source and image review, a clear correction process, and ongoing feedback from educators and partners.",
        image: "/images/skypa-ai-textbook.png",
        imageAlt: "Concept image of a student-facing AI literacy workbook.",
        cta: { label: "Ask about the initiative", href: "/contact" },
      },
      {
        type: "cards",
        title: "Topics under consideration.",
        body: "These are core learning themes in active review and iteration, shaped by classroom use, educator feedback, and practical implementation.",
        cards: [
          { title: "How AI works", body: "Simple models for data, patterns, outputs, and the limits of automated systems.", icon: "book" },
          { title: "Using AI thoughtfully", body: "Prompts, verification, attribution, creativity, and keeping a learner's own thinking visible.", icon: "lightbulb" },
          { title: "Safety and judgment", body: "Privacy, bias, synthetic media, misinformation, adult support, and knowing when to pause.", icon: "shield" },
        ],
      },
      {
        type: "steps",
        title: "How we build classroom-ready learning materials.",
        steps: [
          { title: "01 · Defined & Developed", body: "We established the learning goals, intended age groups, scope, sources, and practical format before developing the materials." },
          { title: "02 · Reviewed & Tested", body: "The materials were reviewed for educational quality, accessibility, safeguarding, accuracy, and clarity, with feedback incorporated throughout the process." },
          { title: "03 · Validated for Use", body: "The completed materials were checked against their intended learning outcomes and reviewed to ensure they are practical, age-appropriate, and ready for implementation." },
          { title: "04 · Released & Updated", body: "The approved version is now available for use. We document releases, continue gathering feedback, and update the materials as we learn." },
        ],
      },
    ],
  },
  {
    slug: "schools",
    title: "For Schools and Education Partners",
    eyebrow: "Active collaboration",
    summary: "SetuAI works with schools and education nonprofits on practical AI literacy partnerships, grounded in local context and clear partnership standards.",
    description: "Start a conversation with SetuAI about an AI literacy collaboration for a school or education nonprofit.",
    image: "/images/skypa-partnership-workshop.png",
    imageAlt: "Concept image representing educators and students collaborating.",
    cta: { label: "Start a school conversation", href: "/contact?interest=school" },
    secondaryCta: { label: "Read the safeguarding approach", href: "/safeguarding", variant: "secondary" },
    sections: [
      {
        type: "text",
        title: "A useful first conversation starts with context.",
        body: [
          "SetuAI is not publishing a catalogue of confirmed workshops yet. The first step is learning from educators and youth-serving organizations about grade levels, local policy, family communication, device access, timing, supervision, and the questions students already have.",
          "That discovery work helps determine whether an AI literacy collaboration is appropriate, what safeguards it would require, and whether the material should be adapted or paused.",
        ],
      },
      {
        type: "steps",
        title: "A responsible pathway from interest to a possible pilot.",
        steps: [
          { title: "Share the setting", body: "Tell us who you serve, what your students need, and the constraints educators need us to respect." },
          { title: "Review fit and safeguards", body: "Clarify adult supervision, privacy, consent, accessibility, school policy, and the type of support that might be appropriate." },
          { title: "Define a small next step", body: "If there is a fit, agree on a documented pilot scope rather than implying a finished program exists." },
          { title: "Learn before expanding", body: "Use feedback and documented outcomes to decide whether a future collaboration should continue, change, or stop." },
        ],
      },
      {
        type: "cta",
        title: "Bring the realities of your setting.",
        body: "Include age group, location, educational context, timeline, existing AI guidance, accessibility needs, and the kind of conversation you hope to have. SetuAI will not promise a format before that context is understood.",
        ctas: [{ label: "Contact SetuAI", href: "/contact?interest=school" }],
      },
    ],
  },
  {
    slug: "impact",
    title: "How SetuAI Will Measure Responsibly",
    eyebrow: "Measurement in design",
    summary: "SetuAI has no verified impact figures to report yet. It is building a transparent measurement approach before public outcomes are claimed.",
    description: "Read how SetuAI plans to document future AI literacy work responsibly before publishing participant, partner, or learning impact claims.",
    cta: { label: "Share a measurement perspective", href: "/contact" },
    sections: [
      {
        type: "text",
        title: "No impact numbers before there is evidence.",
        body: [
          "SetuAI will not treat projected seats, informal conversations, or proposed learning tracks as completed impact. The site currently reports no verified learner, school, distribution, fundraising, or program outcomes.",
          "Before publishing metrics, the organization needs a consistent definition, collection method, review owner, reporting date, and clear distinction between activity, output, feedback, and outcome.",
        ],
      },
      {
        type: "cards",
        title: "A future public report should make four things visible.",
        cards: [
          { title: "What happened", body: "The date, setting, activity, partner role, and participant count, with the source of the record.", icon: "school" },
          { title: "What was learned", body: "Feedback and evidence presented with limitations, not converted into broad claims without support.", icon: "lightbulb" },
          { title: "What changed", body: "The edits made after review, including material corrections, access improvements, and safeguards.", icon: "check" },
          { title: "What remains unknown", body: "Open questions and missing evidence stated plainly so visitors can judge the work fairly.", icon: "message" },
        ],
      },
    ],
  },
  {
    slug: "privacy",
    title: "Privacy and Data Use",
    eyebrow: "Working notice",
    summary: "This privacy notice explains how SetuAI handles inquiries and update subscriptions while operating the website and community contact process.",
    description: "Read SetuAI's privacy and data-use notice for site inquiries, image uploads, and update subscriptions.",
    sections: [
      {
        type: "text",
        title: "What this site collects.",
        body: [
          "When a visitor sends an inquiry, the site collects the information entered in the form, including name, email address, organization, selected interest, and message. When a visitor subscribes to updates, the site collects the name and email address provided for that purpose.",
          "The site does not ask for payment details, student records, health information, or sensitive personal information. Do not submit those details through public forms.",
          "This notice reflects how the site currently operates and is reviewed as part of SetuAI's ongoing operational practices. We keep the information clear, limited, and aligned with the work the site is actually doing.",
        ],
      },
      {
        type: "cards",
        title: "How information is used.",
        cards: [
          { title: "Respond to the message", body: "Inquiry details are used to understand and reply to the requested conversation." },
          { title: "Send requested updates", body: "Update subscriptions are separate from inquiries and should only be used for the updates a visitor explicitly requested." },
          { title: "Protect the service", body: "Limited technical information may be used for fraud prevention, rate limiting, and maintaining the site." },
        ],
      },
      {
        type: "cta",
        title: "Questions or deletion requests.",
        body: "Until a formal privacy contact is named, use the public contact form and choose a general question. Do not include sensitive information in the request.",
        ctas: [{ label: "Contact SetuAI", href: "/contact" }],
      },
    ],
  },
  {
    slug: "accessibility",
    title: "Accessibility Commitment",
    eyebrow: "Working commitment",
    summary: "SetuAI builds and improves its public materials and website around clear language, keyboard access, reduced motion, and an open feedback route.",
    description: "Read SetuAI's accessibility commitment and report a barrier on the website.",
    sections: [
      {
        type: "text",
        title: "Accessibility is part of the learning design.",
        body: [
          "SetuAI aims to make its website, materials, and future learning experiences usable by people with different access needs. Current site work includes semantic structure, visible keyboard focus, responsive layouts, text alternatives for images, and reduced-motion support.",
          "Accessibility is ongoing work, not a completed claim. Report a barrier, missing alternative format, or unclear page through the contact form so it can be reviewed and tracked.",
        ],
      },
      {
        type: "cta",
        title: "Report an access barrier.",
        body: "Tell us which page or material you used, what happened, your browser or device if relevant, and a safe way to follow up. Do not share sensitive personal information.",
        ctas: [{ label: "Report a barrier", href: "/contact" }],
      },
    ],
  },
  {
    slug: "safeguarding",
    title: "Safeguarding Approach",
    eyebrow: "Operational standard",
    summary: "SetuAI works with partners to ensure student-facing activities meet safeguarding, supervision, privacy, and escalation standards before they proceed.",
    description: "Read SetuAI's safeguarding approach for AI literacy activities involving young people.",
    sections: [
      {
        type: "text",
        title: "Safeguards are built into how we work.",
        body: [
          "SetuAI works with host partners to agree on adult supervision, screening requirements, consent, photography rules, data handling, accessibility, tool access, incident reporting, and escalation contacts before student-facing activity proceeds.",
          "A website statement cannot replace a host school's or youth-serving organization's safeguarding policy. SetuAI works within the applicable partner requirements and pauses activity where the necessary protections are not in place.",
        ],
      },
      {
        type: "cards",
        title: "Minimum conditions for a future activity.",
        cards: [
          { title: "Named adults and escalation", body: "Clear accountable contacts, supervision expectations, and a documented route for raising concerns." },
          { title: "Privacy-aware tools", body: "Approved tools, appropriate account handling, and no request for unnecessary student personal data." },
          { title: "Age-appropriate learning", body: "Materials, examples, permissions, and activities reviewed for the intended group and setting." },
          { title: "Partner agreement", body: "A written shared understanding of roles, limits, feedback, and what happens if a concern is raised." },
        ],
      },
    ],
  },
];

export const corePages: SitePage[] = corePagesBase;

// There are no confirmed public programs, stories, resources, or initiatives at launch.
// The custom CMS can create and publish them once they have factual content and approval.
export const programs: Program[] = [];
export const stories: Story[] = [];
export const resources: Resource[] = [];
export const updates: Update[] = [];
export const initiatives: Initiative[] = [];

export function getCorePage(slug: string) {
  return corePages.find((page) => page.slug === slug);
}

export function getProgram(slug: string) {
  return programs.find((program) => program.slug === slug);
}

export function getStory(slug: string) {
  return stories.find((story) => story.slug === slug);
}

export function getResource(slug: string) {
  return resources.find((resource) => resource.slug === slug);
}

export function getUpdate(slug: string) {
  return updates.find((update) => update.slug === slug);
}

export function getInitiative(slug: string) {
  return initiatives.find((initiative) => initiative.slug === slug);
}

export const allStaticPaths = [
  "/",
  ...corePages.map((page) => `/${page.slug}`),
  "/programs",
  "/updates",
  "/partners",
  "/get-involved",
  "/contact",
];

export const chatbotKnowledge = [
  "SetuAI is an active AI literacy initiative convened by Summit Intelligent Systems, Shikivaa Foundation, and SKYPA Foundation.",
  "SetuAI builds practical AI literacy materials and works with schools, education nonprofits, and community partners to improve the learning experience through review and implementation.",
  "The initiative develops classroom-ready learning materials, including student-facing textbook content and supporting educational resources, with clear review and safeguarding standards.",
  "Schools, education nonprofits, and partners can use the contact form to begin a practical conversation. The form is not a booking or donation flow.",
  "Visitors can subscribe to updates only if they want emailed progress notices. Inquiries should not automatically subscribe someone to updates.",
  "Do not invent confirmed partner names, school names, program dates, student counts, tax status, legal status, or impact numbers.",
];
