import {
  footerColumns,
  foundingPartners,
  headerNav,
  impactStats,
  siteConfig,
  type Cta,
  type LinkItem,
  type Stat,
} from "@/content/site";

export type EditableCard = {
  title: string;
  body: string;
  href?: string;
  icon?: string;
};

export type EditableImage = {
  src: string;
  alt: string;
};

export type EditableHomeContent = {
  hero: {
    kicker: string;
    title: string;
    body: string;
    image: EditableImage;
    primaryCta: Cta;
    secondaryCta: Cta;
  };
  intro: {
    kicker: string;
    title: string;
    featuredStatement: string;
    body: string[];
  };
  stats: Stat[];
  learning: {
    title: string;
    body: string;
    cards: EditableCard[];
  };
  heartbeat: {
    kicker: string;
    title: string;
    body: string;
    image: EditableImage;
    pulses: string[];
  };
  textbook: {
    kicker: string;
    title: string;
    body: string;
    image: EditableImage;
    calloutLabel: string;
    calloutTitle: string;
    bullets: string[];
    primaryCta: Cta;
    secondaryCta: Cta;
  };
  audience: {
    title: string;
    body: string;
    cards: EditableCard[];
  };
  process: {
    kicker: string;
    title: string;
    body: string;
    steps: string[];
  };
  closingCta: {
    title: string;
    body: string;
    primaryCta: Cta;
    secondaryCta: Cta;
  };
};

export type EditableGlobalContent = {
  siteName: string;
  shortName: string;
  tagline: string;
  description: string;
  email: string;
  logo: EditableImage;
  navCta: Cta;
  navigation: LinkItem[];
  footerColumns: { title: string; links: LinkItem[] }[];
  footerUtilityLinks: LinkItem[];
  foundingPartners: EditableFoundingPartner[];
  serviceArea: string;
  copyrightLine: string;
};

export type EditableFoundingPartner = {
  name: string;
  href: string;
  role: string;
  body: string;
};

export type EditableSeoContent = {
  homeTitle: string;
  homeDescription: string;
  homeImage: string;
};

export type EditableVisualSettings = {
  hero3dEnabled: boolean;
  hero3dLabel: string;
  heartbeat3dEnabled: boolean;
  heartbeat3dLabel: string;
  motionEnabled: boolean;
  visualDensity: "calm" | "active" | "immersive";
};

export type EditableSiteContent = {
  contentVersion: string;
  global: EditableGlobalContent;
  seo: EditableSeoContent;
  home: EditableHomeContent;
  visuals: EditableVisualSettings;
  updatedAt: string;
};

export const siteContentSchemaVersion = "launched-2026-08";

export const fallbackSiteContent: EditableSiteContent = {
  contentVersion: siteContentSchemaVersion,
  global: {
    siteName: siteConfig.name,
    shortName: siteConfig.shortName,
    tagline: siteConfig.tagline,
    description: siteConfig.description,
    email: siteConfig.email,
    logo: {
      src: "",
      alt: "SetuAI wordmark",
    },
    navCta: {
      label: "Start a conversation",
      href: "/contact",
    },
    navigation: headerNav,
    footerColumns,
    foundingPartners: foundingPartners.map((partner) => ({ ...partner })),
    footerUtilityLinks: [
      { label: "Privacy", href: "/privacy" },
      { label: "Accessibility", href: "/accessibility" },
      { label: "Contact", href: "/contact" },
    ],
    serviceArea: "An active initiative for practical AI literacy",
    copyrightLine: "Build with AI, responsibly.",
  },
  seo: {
    homeTitle: "SetuAI | The bridge to AI-literate future",
    homeDescription: siteConfig.description,
    homeImage: "/images/skypa-hero-classroom.png",
  },
  home: {
    hero: {
      kicker: "An active AI literacy initiative",
      title: "SetuAI",
      body: "SetuAI is actively building practical, responsible AI learning with schools, educators, and community partners.",
      image: {
        src: "/images/skypa-hero-classroom.png",
        alt: "Students learning AI literacy with a teacher in a bright classroom.",
      },
      primaryCta: {
        label: "Start a conversation",
        href: "/contact",
        variant: "light",
      },
      secondaryCta: {
        label: "See our approach",
        href: "/about",
        variant: "secondary",
      },
    },
    intro: {
      kicker: "Why this work matters",
      title: "AI is becoming part of childhood. Young people deserve a trusted way to understand it.",
      featuredStatement:
        "SetuAI turns AI from a confusing buzzword into something students can understand, question, and use with judgment.",
      body: [
        "SetuAI is a collaborative initiative with Summit Intelligent Systems contributing technology and implementation experience, Shikivaa Foundation bringing an education-first and community-access perspective, and SKYPA Foundation contributing the originating AI literacy and textbook vision.",
        "We build practical learning materials, work with schools and education partners, and maintain clear safeguarding, accessibility, and review standards as we operate.",
      ],
    },
    stats: impactStats,
    learning: {
      title: "A learning approach built for classrooms, not hype cycles.",
      body: "Our approach is built around clear language, adult-supported practice, and materials that educators can review, adapt, and use with confidence.",
      cards: [
        {
          title: "Explain the systems around them",
          body: "SetuAI uses simple mental models for prompts, training data, outputs, bias, privacy, and human judgment.",
          icon: "lightbulb",
        },
        {
          title: "Practice with responsible tools",
          body: "Our learning work makes verification, attribution, reflection, and adult-supported practice visible.",
          icon: "sparkles",
        },
        {
          title: "Carry the learning home",
          body: "The textbook initiative is designed as a durable resource students and educators can revisit and improve over time.",
          icon: "book",
        },
      ],
    },
    heartbeat: {
      kicker: "The principle underneath the work",
      title: "The point is not more AI. It is better judgment, shared access, and clearer choices.",
      body: "SetuAI is designed around a simple belief: AI literacy should help students ask better questions, help adults guide responsibly, and help communities decide what deserves their trust.",
      image: {
        src: "/images/skypa-partnership-workshop.png",
        alt: "Concept image of educators and students collaborating around learning materials.",
      },
      pulses: [
        "Human judgment before automation",
        "Clear language before technical jargon",
        "Community access before private advantage",
      ],
    },
    textbook: {
      kicker: "Textbook initiative",
      title: "A textbook students can hold, revisit, and question.",
      body: "SetuAI develops student-facing AI literacy materials with a clear review process, practical classroom relevance, and continuous improvement built in.",
      image: {
        src: "/images/skypa-ai-textbook.png",
        alt: "AI literacy textbook and classroom workbook materials.",
      },
      calloutLabel: "How we work",
      calloutTitle: "We develop, review, validate, release, and improve our learning materials.",
      bullets: [
        "Plain-language AI concepts",
        "Thoughtful prompting and verification",
        "Safety, bias, privacy, and human judgment",
      ],
      primaryCta: {
        label: "Explore the textbook initiative",
        href: "/textbook",
        variant: "light",
      },
      secondaryCta: {
        label: "Discuss partnership support",
        href: "/contact?interest=sponsor",
        variant: "secondary",
      },
    },
    audience: {
      title: "Clear next steps for every kind of partner.",
      body: "SetuAI works with educators, learners, and organizations who want practical AI literacy that is grounded in community realities and responsible use.",
      cards: [
        {
          title: "Schools",
          body: "Share your educational context, questions, and constraints for a practical AI literacy conversation.",
          href: "/schools",
          icon: "school",
        },
        {
          title: "Education nonprofits",
          body: "Explore how local knowledge and community access can shape a useful collaboration.",
          href: "/partners",
          icon: "users",
        },
        {
          title: "Companies",
          body: "Discuss current support opportunities, partnership scope, and material development needs.",
          href: "/contact?interest=sponsor",
          icon: "building",
        },
        {
          title: "Volunteers",
          body: "Share your skills, availability, and interest in review, outreach, operations, or facilitation support.",
          href: "/contact?interest=volunteer",
          icon: "heart",
        },
        {
          title: "Families",
          body: "Share the questions families need answered as SetuAI continues to build clear, accessible learning materials.",
          href: "/contact",
          icon: "users",
        },
      ],
    },
    process: {
      kicker: "A responsible partnership path",
      title: "Start with a conversation. Build what comes next.",
      body: "SetuAI works with organizations ready to make AI literacy practical, useful, and trustworthy. Whether you're bringing AI literacy to a school, community, or local learning space, we create a clear path forward.",
      steps: [
        "Understand the setting and intended audience",
        "Review safeguards, capacity, and material readiness",
        "Define the scope, responsibilities, and next step",
        "Put the plan into action with a pilot, workshop, or learning resource",
        "Learn, review, and communicate the outcome",
      ],
    },
    closingCta: {
      title: "Help build an AI literacy initiative worth trusting.",
      body: "Bring a school's perspective, a community need, a review skill, or a partnership idea. SetuAI is clear about what is known, what we are building, and how we work together.",
      primaryCta: {
        label: "Start a conversation",
        href: "/contact",
        variant: "light",
      },
      secondaryCta: {
        label: "Get involved",
        href: "/get-involved",
        variant: "secondary",
      },
    },
  },
  visuals: {
    hero3dEnabled: true,
    hero3dLabel: "Interactive AI learning lattice",
    heartbeat3dEnabled: true,
    heartbeat3dLabel: "Pulsing mission heart built from learning signals",
    motionEnabled: true,
    visualDensity: "calm",
  },
  updatedAt: "2026-07-12T00:00:00.000Z",
};
