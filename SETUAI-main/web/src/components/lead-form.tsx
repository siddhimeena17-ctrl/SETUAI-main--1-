"use client";

import { useState } from "react";
import Link from "next/link";
import { Send } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { translatePhrase } from "@/lib/i18n";

type LeadFormProps = {
  formType: "school" | "volunteer" | "sponsor" | "contact";
  title?: string;
  compact?: boolean;
};

const interestOptions = {
  school: ["School workshop", "Textbook pilot", "Teacher training", "Parent night"],
  volunteer: ["Workshop support", "Curriculum review", "Outreach", "Operations"],
  sponsor: ["Textbook sponsorship", "School pilot", "Corporate volunteering", "General support"],
  contact: ["School partnership", "Volunteer", "Sponsor", "General question"],
};

export function LeadForm({ formType, title = "Start the conversation", compact = false }: LeadFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const { locale } = useLanguage();
  const t = (value: string) => translatePhrase(value, locale);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setStatusMessage("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType, payload }),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) throw new Error(result?.error || "Form submission failed");

      form.reset();
      setStatus("success");
      setStatusMessage(result?.subscription === "confirmation-sent" ? "Thanks. Your inquiry was received. Check your email to confirm the separate updates subscription." : "Thanks. Your inquiry was received.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "Something went wrong. Please try again or contact SetuAI another way.");
    }
  }

  const fieldClass =
    "focus-ring min-h-11 border border-[var(--color-line)] bg-[var(--background)] px-3 text-base font-normal text-[var(--color-ink)] placeholder:text-[rgb(28_25_23/0.48)]";

  return (
    <form
      onSubmit={onSubmit}
      className="soft-card p-5 sm:p-6"
    >
      <div className={compact ? "mb-5" : "mb-7"}>
        <p className="section-kicker">{t("Outreach form")}</p>
        <h2 className="mt-2 text-2xl font-light tracking-tight text-[var(--color-ink)]">{t(title)}</h2>
        <p className="pretty mt-2 text-sm leading-6 text-[var(--color-muted)]">
          {t("Send the basics. SetuAI can follow up with the right program, sponsorship, or volunteer path.")}
        </p>
      </div>

      <input type="text" name="companyWebsite" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          {t("Name")}
          <input
            required
            name="name"
            autoComplete="name"
            maxLength={120}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          {t("Email")}
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            spellCheck={false}
            maxLength={160}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          {t("Organization")}
          <input
            name="organization"
            autoComplete="organization"
            maxLength={160}
            className={fieldClass}
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-[var(--color-ink)]">
          {t("Interest")}
          <select
            required
            name="interest"
            className={fieldClass}
          >
            <option value="">{t("Choose one")}</option>
            {interestOptions[formType].map((option) => (
              <option key={option} value={option}>{t(option)}</option>
            ))}
          </select>
        </label>
      </div>

      <label className="mt-4 grid gap-2 text-sm font-medium text-[var(--color-ink)]">
        {t("Message")}
        <textarea
          required
          name="message"
          rows={compact ? 3 : 5}
          maxLength={2000}
          className={`${fieldClass} py-3`}
          placeholder={t("Tell us about grade levels, timeline, location, or how you would like to help…")}
        />
      </label>

      <div className="mt-4 grid gap-3 border-t border-[var(--color-line)] pt-4">
        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--color-muted)]">
          <input required type="checkbox" name="privacyAcknowledged" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-coral)]" />
          <span>I understand SetuAI will use this message to respond, as described in the <Link href="/privacy" className="font-medium text-[var(--color-ink)] underline underline-offset-4">privacy notice</Link>.</span>
        </label>
        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--color-muted)]">
          <input type="checkbox" name="updatesOptIn" className="mt-1 h-4 w-4 shrink-0 accent-[var(--color-coral)]" />
          <span>Also send me SetuAI progress updates. This is optional and requires email confirmation.</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="focus-ring mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 bg-[var(--color-deep)] px-5 py-3 text-sm font-medium tracking-wide text-white transition-colors duration-150 hover:bg-[var(--color-coral)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Send aria-hidden="true" size={16} />
        {status === "loading" ? t("Sending…") : t("Send Inquiry")}
      </button>

      {status === "success" ? (
        <p className="mt-4 border border-[var(--color-coral)] bg-[var(--color-teal-soft)] px-4 py-3 text-sm font-medium text-[var(--color-deep)]" role="status" aria-live="polite">
          {statusMessage || t("Thanks. Your inquiry was received.")}
        </p>
      ) : null}
      {status === "error" ? (
        <p className="mt-4 border border-[var(--color-coral)] bg-[var(--color-teal-soft)] px-4 py-3 text-sm font-medium text-[var(--color-deep)]" role="alert">
          {statusMessage || t("Something went wrong. Please try again or contact SetuAI another way.")}
        </p>
      ) : null}
    </form>
  );
}
