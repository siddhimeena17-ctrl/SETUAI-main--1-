"use client";

import { useLanguage } from "@/components/language-provider";
import { translatePhrase } from "@/lib/i18n";

type LocalizedTextProps = {
  en: string;
  hi?: string;
};

export function LocalizedText({ en, hi }: LocalizedTextProps) {
  const { locale } = useLanguage();
  const useReviewedHindiContent = process.env.NEXT_PUBLIC_HINDI_CONTENT_REVIEWED === "true";

  return <>{locale === "hi" ? (useReviewedHindiContent ? hi || translatePhrase(en, "hi") : translatePhrase(en, "hi")) : en}</>;
}
