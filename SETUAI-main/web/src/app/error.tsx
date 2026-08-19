"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    void error;
  }, [error]);

  return (
    <section className="section-pad bg-[var(--background)]">
      <div className="section-shell max-w-4xl border-y border-[var(--color-line)] py-12 sm:py-20">
        <p className="section-kicker">Service interruption</p>
        <h1 className="balance mt-5 text-[clamp(2.6rem,6vw,4.8rem)] font-light leading-none tracking-tight text-[var(--color-ink)]">This page could not load right now.</h1>
        <p className="pretty mt-6 max-w-[58ch] text-lg leading-8 text-[var(--color-muted)]">No information was lost from your browser. Try the page again, or return later if the problem continues.</p>
        <button type="button" onClick={reset} className="focus-ring mt-8 inline-flex min-h-11 items-center justify-center bg-[var(--color-deep)] px-5 py-3 text-sm font-medium text-white hover:bg-[var(--color-coral)]">Try again</button>
      </div>
    </section>
  );
}
