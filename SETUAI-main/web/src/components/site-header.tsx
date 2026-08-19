"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { ButtonLink } from "@/components/button-link";
import { LanguageToggle } from "@/components/language-toggle";
import { useLanguage } from "@/components/language-provider";
import { SetuAiMark } from "@/components/setuai-mark";
import type { EditableSiteContent } from "@/content/editable-site";
import { translatePhrase } from "@/lib/i18n";

export function SiteHeader({ content }: { content: EditableSiteContent }) {
  const { global } = content;
  const { locale } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = (value: string) => translatePhrase(value, locale);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--background)]">
      <a
        href="#main"
        className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--background)] focus:px-4 focus:py-2 focus:text-[var(--color-ink)]"
      >
        {t("Skip to content")}
      </a>
      <div className="mx-auto flex min-h-20 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label={`${global.siteName} home`}>
          {global.logo.src ? (
            <span className="grid h-12 w-12 place-items-center border border-[var(--color-line)] bg-[var(--color-surface)]">
              <Image
                src={global.logo.src}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 object-contain"
                priority
              />
            </span>
          ) : (
            <SetuAiMark
              className="h-12 w-12 border border-[var(--color-line)] bg-[var(--color-surface)]"
              preload
              sizes="48px"
            />
          )}
          <span className="leading-tight">
            <span className="block text-lg font-semibold tracking-tight text-[var(--color-ink)]" translate="no">{global.siteName}</span>
            <span className="block text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted)]">
              {t("Joint AI literacy initiative")}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("Main navigation")}>
          {global.navigation.map((item) =>
            item.children ? (
              <div className="group relative" key={item.label}>
                <Link
                  href={item.href}
                  className="focus-ring flex min-h-11 items-center gap-1 px-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-tint)]"
                >
                  {t(item.label)}
                  <ChevronDown aria-hidden="true" size={15} />
                </Link>
                <div className="invisible absolute left-0 top-full w-[330px] translate-y-2 border border-[var(--color-line)] bg-[var(--background)] p-3 opacity-0 transition-[opacity,transform,visibility] duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  {item.children.map((child) => (
                    <Link
                      href={child.href}
                      key={child.href}
                      className="focus-ring block p-3 hover:bg-[var(--color-surface-tint)]"
                    >
                      <span className="block text-sm font-semibold text-[var(--color-ink)]">{t(child.label)}</span>
                      {child.description ? (
                        <span className="mt-1 block text-sm leading-5 text-[var(--color-muted)]">
                          {t(child.description)}
                        </span>
                      ) : null}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className="focus-ring flex min-h-11 items-center px-3 text-sm font-medium text-[var(--color-ink)] hover:bg-[var(--color-surface-tint)]"
              >
                {t(item.label)}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageToggle />
          <ButtonLink label={global.navCta.label} href={global.navCta.href} variant={global.navCta.variant} />
        </div>

        <div className="relative lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="focus-ring flex h-11 w-11 items-center justify-center border border-[var(--color-line)] text-[var(--color-ink)]"
            aria-expanded={menuOpen}
            aria-controls="site-mobile-menu"
            aria-label={menuOpen ? t("Close menu") : t("Open menu")}
          >
            {menuOpen ? <X aria-hidden="true" size={22} /> : <Menu aria-hidden="true" size={22} />}
          </button>
          {menuOpen ? (
          <nav id="site-mobile-menu" className="absolute right-0 top-14 w-[min(92vw,360px)] border border-[var(--color-line)] bg-[var(--background)] p-3" aria-label={t("Main navigation")}>
            {global.navigation.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="focus-ring block px-3 py-3 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-tint)]"
                >
                  {t(item.label)}
                </Link>
                {item.children ? (
                  <div className="mb-2 ml-3 border-l border-[var(--color-line)] pl-3">
                    {item.children.map((child) => (
                      <Link
                        href={child.href}
                        key={child.href}
                        onClick={() => setMenuOpen(false)}
                        className="focus-ring block px-3 py-2 text-sm font-medium text-[var(--color-muted)] hover:bg-[var(--color-surface-tint)]"
                      >
                        {t(child.label)}
                      </Link>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
            <div className="mt-2 grid gap-2 border-t border-[var(--color-line)] pt-3">
              <LanguageToggle className="w-full" />
              <ButtonLink label={global.navCta.label} href={global.navCta.href} variant={global.navCta.variant} className="w-full" />
            </div>
          </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
