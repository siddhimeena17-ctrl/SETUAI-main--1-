import Link from "next/link";
import { Building2, GraduationCap, HandHeart, HeartHandshake } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Get Involved",
  description:
    "Get involved with SetuAI as a prospective school partner, volunteer, sponsor, corporate partner, or community collaborator.",
  path: "/get-involved",
});

export default function GetInvolvedPage() {
  const paths = [
    {
      title: "School partner",
      body: "Share your school's context and questions for a possible future AI literacy collaboration.",
      href: "/contact?interest=school",
      icon: GraduationCap,
    },
    {
      title: "Volunteer",
      body: "Register interest in future reviewed roles such as curriculum feedback, operations, or outreach.",
      href: "/contact?interest=volunteer",
      icon: HandHeart,
    },
    {
      title: "Sponsor",
      body: "Discuss prospective support without a donation, tax receipt, or delivery promise from this site.",
      href: "/contact?interest=sponsor",
      icon: HeartHandshake,
    },
    {
      title: "Corporate partner",
      body: "Explore whether your company can support future access, review, or operational capacity responsibly.",
      href: "/contact?interest=sponsor",
      icon: Building2,
    },
  ];

  return (
    <>
      <section className="bg-[var(--color-deep)] text-white">
        <div className="section-shell py-16 lg:py-24">
          <p className="section-kicker section-kicker-accent">Get involved</p>
          <h1 className="balance mt-5 max-w-4xl text-[clamp(3rem,7vw,5.5rem)] font-light leading-none tracking-tight">
            Help build AI literacy worth trusting.
          </h1>
          <p className="pretty mt-5 max-w-3xl text-lg leading-8 text-white/76">
            SetuAI is actively building practical AI literacy with schools, educators, families, volunteers, and community partners. We welcome practical collaboration and thoughtful participation in the work as it grows.
          </p>
        </div>
      </section>
      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 sm:grid-cols-2">
            {paths.map((path) => (
              <Link
                href={path.href}
                key={path.title}
                className="soft-card p-6 transition-transform duration-150 hover:-translate-y-0.5 hover:bg-[var(--color-surface)]"
              >
                <path.icon aria-hidden="true" className="text-[var(--color-coral)]" size={28} />
                <h2 className="mt-5 text-xl font-normal tracking-tight text-[var(--color-ink)]">{path.title}</h2>
                <p className="pretty mt-3 text-sm leading-6 text-[var(--color-muted)]">{path.body}</p>
              </Link>
            ))}
          </div>
          <LeadForm formType="contact" compact title="Find your best role" />
        </div>
      </section>
      <section className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell">
          <div className="max-w-3xl">
            <h2 className="balance text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)]">
              Different people can shape the work in different ways.
            </h2>
            <p className="pretty mt-4 text-lg leading-8 text-[var(--color-muted)]">
              Useful early contributions include a school introduction, curriculum or accessibility feedback, sponsorship perspective, safeguarding expertise, operations help, design support, or simply helping the right educator join the conversation. Participation is not an appointment or commitment.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              {
                title: "People who know schools",
                body: "Introduce SetuAI to educators, school leaders, PTAs, or youth-serving organizations that can share real context.",
              },
              {
                title: "People who like teaching",
                body: "Offer curriculum, accessibility, safeguarding, facilitation, or communications perspective before any student-facing role is designed.",
              },
              {
                title: "People who can fund access",
                body: "Help define what responsible future material, review, pilot, or capacity support would require. No donation is processed here.",
              },
            ].map((item) => (
              <article key={item.title} className="soft-card p-6">
                <h3 className="text-xl font-normal tracking-tight text-[var(--color-ink)]">{item.title}</h3>
                <p className="pretty mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad bg-[var(--background)]">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <p className="section-kicker">Fit check</p>
          <h2 className="balance mt-5 text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)]">
            What to include when you reach out.
          </h2>
          <div className="mt-8 divide-y divide-[var(--color-line)] border border-[var(--color-line)]">
            {[
              ["For school partnerships", "Share grade levels, number of students, schedule constraints, location, existing AI policies, and whether you want a workshop, assembly, pilot, or textbook connection."],
              ["For volunteering", "Share your skills, age or role if relevant, availability, location, languages, and whether you prefer student-facing or operations support."],
              ["For sponsorship", "Share whether you want to support textbooks, a school cohort, workshop materials, educator training, or general growth."],
              ["For general questions", "Share the audience you care about and what you are trying to understand. SetuAI can help route you to the right next step."],
            ].map(([question, answer]) => (
              <details key={question} className="group p-6">
                <summary className="cursor-pointer list-none text-base font-medium text-[var(--color-ink)] marker:hidden">
                  {question}
                </summary>
                <p className="pretty mt-3 text-sm leading-6 text-[var(--color-muted)]">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
