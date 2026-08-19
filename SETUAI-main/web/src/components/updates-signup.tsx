"use client";

import { useState } from "react";
import Link from "next/link";
import { MailPlus } from "lucide-react";

export function UpdatesSignup() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/updates/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
          privacyAcknowledged: formData.get("privacyAcknowledged"),
        }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Subscribe failed");

      form.reset();
      setStatus("success");
      setMessage(result?.confirmed ? "You are already confirmed for updates." : result?.confirmationSent ? "Check your email to confirm the subscription." : "Your request is saved. Email confirmation is not configured yet, so you are not subscribed." );
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The signup did not go through. Please try again.");
    }
  }

  const fieldClass =
    "focus-ring min-h-11 border border-[var(--color-line)] bg-[var(--background)] px-3 text-base font-normal text-[var(--color-ink)] placeholder:text-[rgb(28_25_23/0.48)]";

  return (
    <form
      onSubmit={onSubmit}
      className="soft-card grid gap-3 p-5"
    >
      <div>
        <p className="section-kicker">Updates</p>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-[var(--color-ink)]">Get new posts and events.</h2>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          Name
          <input
            name="name"
            autoComplete="name"
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          Email
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            className={fieldClass}
          />
        </label>
      </div>
      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--color-muted)]">
        <input required type="checkbox" name="privacyAcknowledged" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-coral)]" />
        <span>I agree that SetuAI may use this information to send the updates I requested, as described in the <Link href="/privacy" className="font-medium text-[var(--color-ink)] underline underline-offset-4">privacy notice</Link>.</span>
      </label>
      <button
        type="submit"
        disabled={status === "loading"}
        className="focus-ring inline-flex min-h-11 items-center justify-center gap-2 bg-[var(--color-deep)] px-5 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-[var(--color-coral)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <MailPlus aria-hidden="true" size={16} />
        {status === "loading" ? "Subscribing…" : "Subscribe"}
      </button>
      {status === "success" ? (
        <p className="border border-[var(--color-coral)] bg-[var(--color-teal-soft)] px-4 py-3 text-sm font-medium text-[var(--color-deep)]" role="status" aria-live="polite">
          {message}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="border border-[var(--color-coral)] bg-[var(--color-teal-soft)] px-4 py-3 text-sm font-medium text-[var(--color-deep)]" role="alert">
          {message || "The signup did not go through. Please try again."}
        </p>
      ) : null}
    </form>
  );
}
