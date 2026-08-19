import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-pad bg-[var(--background)]">
      <div className="section-shell max-w-4xl border-y border-[var(--color-line)] py-12 sm:py-20">
        <p className="section-kicker">404</p>
        <h1 className="balance mt-5 text-[clamp(2.8rem,7vw,5.5rem)] font-light leading-none tracking-tight text-[var(--color-ink)]">This page is not published here.</h1>
        <p className="pretty mt-6 max-w-[58ch] text-lg leading-8 text-[var(--color-muted)]">It may have been moved, removed, or it may be a future SetuAI page that has not been reviewed for public release yet.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link href="/" className="focus-ring inline-flex min-h-11 items-center justify-center bg-[var(--color-deep)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--color-coral)]">Return home</Link>
          <Link href="/contact" className="focus-ring inline-flex min-h-11 items-center justify-center border border-[var(--color-line)] px-5 py-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface)]">Contact SetuAI</Link>
        </div>
      </div>
    </section>
  );
}
