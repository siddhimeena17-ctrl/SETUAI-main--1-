import { foundingPartners } from "@/content/site";
export type Recommendation = {
  id: string;
  organization: string;
  website: string;
  logo: string;
  signatory: string;
  role: string;
  excerpt: string;
  date: string;
  scope: string;
  letterUrl: string;
  letterLabel: string;
  sourceDocument: string;
  order: number;
  featured: boolean;
  status: "draft" | "published";
  approval: "pending" | "approved";
};
export type PartnerEntry = {
  id: string;
  name: string;
  website: string;
  logo: string;
  category:
    | "Founding collaboration"
    | "Educational partnership"
    | "Technology partnership"
    | "Financial sponsorship";
  scope: string;
  description: string;
  status: "draft" | "published";
  approval: "pending" | "approved";
  order: number;
};
export type InitiativeContent = {
  homeOrder: string[];
  impact: {
    value: string;
    label: string;
    description: string;
    reportingDate: string;
    sourceNote: string;
  };
  textbook: {
    title: string;
    status: string;
    overview: string;
    audience: string;
    topics: string[];
    image: string;
    imageAlt: string;
    sampleUrl: string;
    sampleLabel: string;
  };
  partnerTitle: string;
  partnerIntro: string;
  updatesTitle: string;
  recommendationTitle: string;
  recommendationContext: string;
  recommendations: Recommendation[];
  chapters: {
    title: string;
    overview: string;
    audience: string;
    support: string[];
    responsibilities: string[];
    process: string[];
    faqs: { question: string; answer: string }[];
    applicationsOpen: boolean;
  };
  platform: {
    title: string;
    overview: string;
    collaboration: string;
    capabilities: string[];
    betaOpen: boolean;
    url: string;
    image: string;
    imageAlt: string;
    participation: string;
    feedback: string;
  };
  partners: PartnerEntry[];
};
export const newRecommendation: Recommendation = {
  id: "",
  organization: "",
  website: "",
  logo: "",
  signatory: "",
  role: "",
  excerpt: "",
  date: "",
  scope: "Textbook review",
  letterUrl: "",
  letterLabel: "Read public letter excerpt (PDF)",
  sourceDocument: "",
  order: 10,
  featured: false,
  status: "draft",
  approval: "pending",
};
export const newPartner: PartnerEntry = {
  id: "",
  name: "",
  website: "",
  logo: "",
  category: "Educational partnership",
  scope: "",
  description: "",
  order: 10,
  status: "draft",
  approval: "pending",
};
export const defaultInitiatives: InitiativeContent = {
  homeOrder: [
    "impact",
    "textbook",
    "recommendations",
    "chapters",
    "platform",
    "mission",
    "programs",
    "partners",
    "updates",
    "participate",
  ],
  impact: {
    value: "14,000",
    label: "students reached",
    description:
      "Practical AI literacy, shared through SetuAI’s work with schools and communities.",
    reportingDate: "",
    sourceNote:
      "Reach figure supplied by SetuAI. Reach describes participation and access; it is not a measure of graduation, active platform use, or verified learning outcomes.",
  },
  textbook: {
    title: "SETU AI: A Field Guide to Building with Artificial Intelligence",
    status: "Being prepared for publication",
    overview:
      "A practical AI literacy textbook that helps young people understand, build with, and critically evaluate AI. The manuscript has been reviewed by education organizations and is now being prepared for publication.",
    audience:
      "Students in Grades 8–12, with educators and community facilitators supporting their learning.",
    topics: [
      "AI fundamentals and large language models",
      "Prompt engineering and fact-checking",
      "AI-assisted coding",
      "Creative applications and entrepreneurship",
      "Hallucinations, bias, privacy, and responsible use",
      "Guided challenges, case studies, and reflection",
    ],
    image: "",
    imageAlt: "",
    sampleUrl: "",
    sampleLabel: "Read the approved sample",
  },
  partnerTitle: "Working together on AI literacy.",
  partnerIntro:
    "Our partners contribute education, community access, and technology expertise. Each relationship is described by its actual contribution.",
  updatesTitle: "From the work.",
  recommendationTitle: "Perspectives following textbook review",
  recommendationContext:
    "These excerpts come from recommendation letters for SetuAI founder Siddhi Meena. Each describes the textbook or its educational use in the organization’s own words. The letters also discuss Siddhi’s work; they are not blanket endorsements of every SetuAI activity.",
  recommendations: [
    {
      ...newRecommendation,
      id: "onestage",
      organization: "OneStage",
      website: "https://theonestage.org/",
      signatory: "Abhijit Biswas",
      role: "Department Head - Tech4Good",
      date: "2026-06-05",
      excerpt:
        "We particularly value the textbook’s attention to judgment. Learning to use AI also means learning to check its claims, recognise bias, protect personal information, and take responsibility for the work produced with it.",
      scope: "Textbook review and educational implementation",
      sourceDocument: "Siddhi_OneStage.pdf",
      letterUrl: "/letters/onestage-excerpt.pdf",
      order: 1,
      featured: true,
      status: "published",
      approval: "approved",
    },
    {
      ...newRecommendation,
      id: "learnovate",
      organization: "Learnovate Robotics",
      website: "https://learnovaterobotics.com/",
      signatory: "Ashish Vishwakarma",
      role: "Authorized Signatory",
      date: "2026-10-10",
      excerpt:
        "Students are encountering tools that can answer questions, generate content, and help them build at remarkable speed. They also need the judgment to check an answer, recognise a limitation, and consider the consequences of using a tool.",
      scope: "Textbook review and adoption collaboration",
      sourceDocument: "Siddhi_Learnovate.pdf",
      letterUrl: "/letters/learnovate-excerpt.pdf",
      order: 2,
      featured: true,
      status: "published",
      approval: "approved",
    },
    {
      ...newRecommendation,
      id: "ikpf",
      organization: "Indigo Knowledge Prism Foundation",
      website: "https://knowledgeprism.org/",
      signatory: "Sachin Kumar",
      role: "Director",
      date: "",
      excerpt:
        "Designed for adaptation across languages and educational settings, it combines foundational concepts with guided challenges, case studies, practical applications, and reflection.",
      scope: "Textbook review and implementation support",
      sourceDocument: "Siddhi_IKPF.pdf",
      letterUrl: "/letters/ikpf-excerpt.pdf",
      order: 3,
      featured: true,
      status: "published",
      approval: "approved",
    },
    {
      ...newRecommendation,
      id: "tctf",
      organization: "The Creative Thinkers Forum",
      website: "https://tctfindia.org/",
      signatory: "Kulsum Farooqui",
      role: "President",
      date: "2026-10-09",
      excerpt:
        "This balance is valuable for learners who need both the confidence to explore unfamiliar tools and the ability to question their outputs.",
      scope:
        "Textbook adoption as a supplementary AI literacy resource within CCAB",
      sourceDocument: "Siddhi_TCTF.pdf",
      letterUrl: "/letters/tctf-excerpt.pdf",
      order: 4,
      featured: true,
      status: "published",
      approval: "approved",
    },
  ],
  chapters: {
    title: "Bring SetuAI to your community.",
    overview:
      "Start a SetuAI chapter in your school, college, or community. Bring people together to explore AI, run learning sessions, and help others use technology with judgment.",
    audience:
      "Students, educators, and community organizers interested in coordinating a local chapter can apply. We discuss the host setting, supervision, and practical arrangements during review.",
    support: [
      "Curriculum and workshop materials from SetuAI",
      "Operation under the SetuAI name, once the chapter is approved",
      "Platform access for chapter members’ interactive learning sessions",
    ],
    responsibilities: [
      "Coordinate activities with your school or community host",
      "Follow agreed safeguarding, privacy, and responsible-use guidance",
      "Plan learning sessions and share feedback with SetuAI",
    ],
    process: [
      "Tell us about your proposed chapter and learning community.",
      "SetuAI reviews the application and follows up on the local context and support needs.",
      "Agree on responsibilities and next steps before a chapter begins operating.",
    ],
    faqs: [
      {
        question: "Where can I start a chapter?",
        answer:
          "You can propose a chapter in a school, college, or community. Include the host organization and location in your application.",
      },
      {
        question: "Does applying mean my chapter is accepted?",
        answer:
          "No. Every application is reviewed, and SetuAI will follow up before a chapter can begin operating under its name.",
      },
      {
        question: "What support does SetuAI provide?",
        answer:
          "SetuAI provides curriculum and workshop materials, and platform access for chapter members’ interactive learning sessions. The arrangements are discussed during review.",
      },
    ],
    applicationsOpen: true,
  },
  platform: {
    title: "AI literacy, with room to explore.",
    overview:
      "SetuAI’s AI literacy platform is open for beta testing. It supports interactive learning sessions for individuals and chapter communities.",
    collaboration:
      "The platform was developed through an international collaborative effort, bringing different perspectives to practical AI learning.",
    capabilities: [
      "Interactive AI literacy learning sessions",
      "Participation by individuals and SetuAI chapters",
    ],
    betaOpen: true,
    url: "",
    image: "",
    imageAlt: "",
    participation:
      "Register your beta interest below. SetuAI will follow up with access details; submitting the form does not provide immediate platform access.",
    feedback:
      "Use the beta form to share what you would like to test. Once you join, reply to SetuAI’s access email with feedback on clarity, accessibility, or your learning experience.",
  },
  partners: [
    ...foundingPartners.map((partner, order): PartnerEntry => ({
      ...newPartner,
      id: `founding-${order}`,
      name: partner.name,
      website: partner.href,
      category:
        order === 0 ? "Technology partnership" : "Founding collaboration",
      scope: partner.role,
      description: partner.body,
      status: "published",
      approval: "approved",
      order,
    })),
    {
      ...newPartner,
      id: "education-onestage",
      name: "OneStage",
      website: "https://theonestage.org/",
      category: "Educational partnership",
      scope: "Textbook adoption and educational implementation",
      description:
        "The supplied OneStage letter describes adoption and implementation of SETU AI through its education programs.",
      status: "published",
      approval: "approved",
      order: 3,
    },
    {
      ...newPartner,
      id: "education-learnovate",
      name: "Learnovate Robotics",
      website: "https://learnovaterobotics.com/",
      category: "Educational partnership",
      scope: "Textbook adoption and classroom implementation collaboration",
      description:
        "Learnovate’s letter describes adoption of SETU AI and ongoing work with Siddhi to implement the curriculum in its partner schools.",
      status: "published",
      approval: "approved",
      order: 4,
    },
    {
      ...newPartner,
      id: "education-ikpf",
      name: "Indigo Knowledge Prism Foundation",
      website: "https://knowledgeprism.org/",
      category: "Educational partnership",
      scope: "Textbook adoption and implementation support",
      description:
        "The supplied letter describes adoption of SETU AI, school implementation support, and work with teachers to use the textbook.",
      status: "published",
      approval: "approved",
      order: 5,
    },
    {
      ...newPartner,
      id: "education-tctf",
      name: "The Creative Thinkers Forum",
      website: "https://tctfindia.org/",
      category: "Educational partnership",
      scope: "Supplementary AI literacy within CCAB",
      description:
        "TCTF’s letter describes adoption of SETU AI as a supplementary resource within its Certificate Course in Active Basic IT.",
      status: "published",
      approval: "approved",
      order: 6,
    },
  ],
};
export function publishedRecommendations(content: InitiativeContent) {
  return content.recommendations
    .filter(
      (item) =>
        item.status === "published" &&
        item.approval === "approved" &&
        item.excerpt &&
        item.organization,
    )
    .sort((a, b) => a.order - b.order);
}
export function publishedPartners(content: InitiativeContent) {
  return content.partners
    .filter(
      (item) =>
        item.status === "published" &&
        item.approval === "approved" &&
        item.name &&
        item.scope,
    )
    .sort((a, b) => a.order - b.order);
}
