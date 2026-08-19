"use client";

import Image from "next/image";
import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { BuiltBySummit } from "@/components/built-by-summit";
import { useLanguage } from "@/components/language-provider";
import { SetuAiMark } from "@/components/setuai-mark";
import type { EditableSiteContent } from "@/content/editable-site";
import { translatePhrase } from "@/lib/i18n";

export function SiteFooter({ content }: { content: EditableSiteContent }) {
  const { global } = content;
  const { locale } = useLanguage();
  const t = (value: string) => translatePhrase(value, locale);

  return (
    <footer className="border-t border-[var(--color-line)] bg-[var(--color-deep)] text-stone-50">
      <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-16 md:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Link href="/" className="flex items-center gap-3" aria-label={`${global.siteName} home`}>
            {global.logo.src ? (
              <span className="grid h-14 w-14 place-items-center border border-stone-50/20 bg-stone-50">
                <Image
                  src={global.logo.src}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain"
                />
              </span>
            ) : (
              <SetuAiMark className="h-14 w-14 border border-stone-50/20" sizes="56px" />
            )}
            <span>
              <span className="block text-xl font-semibold tracking-tight" translate="no">{global.siteName}</span>
              <span className="block text-sm font-normal text-stone-50/70">{t(global.tagline)}</span>
            </span>
          </Link>
          <p className="mt-6 max-w-[56ch] text-sm leading-6 text-stone-50/72">{t(global.description)}</p>
          <div className="mt-6 grid gap-3 text-sm text-stone-50/72">
            <a className="inline-flex items-center gap-2 hover:text-white" href={`mailto:${global.email}`}>
              <Mail aria-hidden="true" size={16} />
              {global.email}
            </a>
            <span className="inline-flex items-center gap-2">
              <MapPin aria-hidden="true" size={16} />
              {t(global.serviceArea)}
            </span>
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7 lg:grid-cols-4">
          {global.footerColumns.map((column) => (
            <div key={column.title}>
              <h2 className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-coral)]">
                {t(column.title)}
              </h2>
              <ul className="mt-4 grid gap-3">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link className="text-sm font-normal text-stone-50/72 hover:text-white" href={link.href}>
                      {t(link.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-stone-50/10">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-4 py-5 text-xs font-medium text-stone-50/60 md:px-8 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
          <p>© {new Date().getFullYear()} {t(global.copyrightLine)}</p>
          <div className="lg:justify-self-center">
            <BuiltBySummit />
          </div>
          <div className="flex gap-4 lg:justify-self-end">
            {global.footerUtilityLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-white">
                {t(link.label)}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
