"use client";

import { useLanguage } from "@/components/language-provider";
import { localeLabels, translatePhrase, type Locale } from "@/lib/i18n";
import { cx } from "@/lib/utils";

const options: Locale[] = ["en", "hi"];

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      className={cx("inline-flex border border-[var(--color-line)] bg-[var(--background)]", className)}
      aria-label={translatePhrase("Language selector", locale)}
    >
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLocale(option)}
          className={cx(
            "focus-ring min-h-10 flex-1 whitespace-nowrap px-2.5 text-center text-xs font-semibold leading-[1.15] transition-colors",
            option === "hi" ? "min-w-[4.9rem] tracking-normal" : "min-w-12 uppercase tracking-[0.12em]",
            locale === option
              ? "bg-[var(--color-deep)] text-white"
              : "text-[var(--color-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-ink)]",
          )}
          aria-pressed={locale === option}
        >
          {localeLabels[option]}
        </button>
      ))}
    </div>
  );
}
