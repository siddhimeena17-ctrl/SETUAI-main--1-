import Image from "next/image";
import { BookOpen, Building2, GraduationCap, HandHeart, ShieldCheck, Users } from "lucide-react";
import { LeadForm } from "@/components/lead-form";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Partners",
  description:
    "Start a SetuAI conversation with a school, company, education nonprofit, library, or community organization.",
  path: "/partners",
  image: "/images/skypa-partnership-workshop.png",
});

export default function PartnersPage() {
  return (
    <>
      <section className="bg-[var(--color-surface)]">
        <div className="section-shell grid gap-10 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:py-24">
          <div className="flex flex-col justify-center">
            <p className="section-kicker">Partners</p>
            <h1 className="balance mt-5 text-[clamp(3rem,7vw,5.5rem)] font-light leading-none tracking-tight text-[var(--color-ink)]">
              Build the conditions for AI literacy.
            </h1>
            <p className="pretty mt-5 text-lg leading-8 text-[var(--color-ink-soft)]">
              SetuAI is actively building partnerships with schools, education nonprofits, companies, libraries, and community groups. We work with partners to understand local needs, shape practical AI learning, and build collaborations that are thoughtful, useful, and responsibly designed.
            </p>
          </div>
          <div className="relative min-h-[380px] overflow-hidden border border-[var(--color-line)] bg-[var(--background)]">
            <Image
              src="/images/skypa-partnership-workshop.png"
              alt="Students, teachers, and volunteers collaborating in a school workshop."
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="grid gap-4">
            {[
              {
                icon: GraduationCap,
                title: "School partners",
                body: "Share your setting, student or community needs, policy context, and questions about a future AI literacy collaboration.",
              },
              {
                icon: Building2,
                title: "Corporate partners",
                body: "Discuss active material development, pilot support, or collaboration opportunities without making commitments beyond what has been agreed.",
              },
              {
                icon: HandHeart,
                title: "Community partners",
                body: "Help SetuAI understand community access needs, adult support, and the conditions for a responsible future activity.",
              },
            ].map((item) => (
              <div key={item.title} className="soft-card p-6">
                <item.icon aria-hidden="true" className="text-[var(--color-coral)]" size={28} />
                <h2 className="mt-4 text-xl font-normal tracking-tight text-[var(--color-ink)]">{item.title}</h2>
                <p className="pretty mt-2 text-sm leading-6 text-[var(--color-muted)]">{item.body}</p>
              </div>
            ))}
          </div>
          <LeadForm formType="school" title="Start a partnership conversation" />
        </div>
      </section>
      <section className="section-pad bg-[var(--color-surface)]">
        <div className="section-shell">
          <div className="max-w-3xl">
            <h2 className="balance text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)]">
              Choose the question you want to explore.
            </h2>
            <p className="pretty mt-4 text-lg leading-8 text-[var(--color-muted)]">
              The best conversation starts with a specific audience and a realistic context. SetuAI listens to understand the learning need, the setting, and the safest next step, then shapes a practical collaboration around that context.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: BookOpen,
                title: "Textbook access",
                body: "Discuss what responsible textbook development, review, access, and future material support could require.",
              },
              {
                icon: Users,
                title: "Student workshops",
                body: "Share the learning context that should shape any future activity before a workshop or pilot is proposed.",
              },
              {
                icon: ShieldCheck,
                title: "Responsible use",
                body: "Help stress-test how privacy, misinformation, bias, attribution, and adult guidance should be handled in future materials.",
              },
              {
                icon: HandHeart,
                title: "Local coalition",
                body: "Connect the people who should be in the room before a local AI literacy plan is made public.",
              },
            ].map((item) => (
              <article key={item.title} className="soft-card p-6">
                <item.icon aria-hidden="true" className="text-[var(--color-coral)]" size={28} />
                <h3 className="mt-5 text-xl font-normal tracking-tight text-[var(--color-ink)]">{item.title}</h3>
                <p className="pretty mt-3 text-sm leading-6 text-[var(--color-muted)]">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section-pad bg-[var(--background)]">
        <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="section-kicker">What happens next</p>
            <h2 className="balance mt-5 text-4xl font-light leading-tight tracking-tight text-[var(--color-ink)]">
              A partnership should be clear before anyone commits.
            </h2>
          </div>
          <ol className="grid gap-4 md:grid-cols-2">
            {[
              ["Share the audience", "Tell SetuAI who you want to serve, including grade levels, location, and whether the setting is a school, company, nonprofit, library, or community group."],
              ["Name the question", "Clarify the learning, access, or community question you want the future work to address."],
              ["Review conditions", "Discuss adult supervision, privacy, accessibility, policy, capacity, and whether a pilot is even appropriate."],
              ["Decide transparently", "Document what is confirmed, what needs review, and whether a future next step should be designed."],
            ].map(([title, body], index) => (
              <li key={title} className="soft-card grid grid-cols-[auto_1fr] gap-4 p-5">
                <span className="grid h-10 w-10 place-items-center bg-[var(--color-deep)] text-sm font-medium text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-medium text-[var(--color-ink)]">{title}</h3>
                  <p className="pretty mt-2 text-sm leading-6 text-[var(--color-muted)]">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
