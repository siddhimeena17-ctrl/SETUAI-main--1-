"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import type { Cta } from "@/content/site";
import { translatePhrase } from "@/lib/i18n";
import { cx } from "@/lib/utils";

type ButtonLinkProps = Cta & {
  className?: string;
};

export function ButtonLink({
  label,
  href,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  const { locale } = useLanguage();

  return (
    <Link
      href={href}
      className={cx(
        "animated-button focus-ring group inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-sm font-medium tracking-wide transition-[background-color,border-color,color,transform] duration-150 active:translate-y-px",
        variant === "primary" &&
          "bg-[var(--color-coral)] text-white hover:bg-[var(--color-coral-deep)]",
        variant === "secondary" &&
          "border border-[var(--color-line)] bg-transparent text-[var(--color-ink)] hover:border-[var(--color-coral)] hover:bg-[var(--color-surface)]",
        variant === "light" &&
          "bg-[var(--background)] text-[var(--color-ink)] hover:bg-[var(--color-surface)]",
        className,
      )}
    >
      <span className="relative">{translatePhrase(label, locale)}</span>
      <ArrowRight aria-hidden="true" className="relative transition-transform duration-200 group-hover:translate-x-1" size={16} strokeWidth={2.4} />
    </Link>
  );
}
