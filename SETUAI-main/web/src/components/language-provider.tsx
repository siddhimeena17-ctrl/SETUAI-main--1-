"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultLocale, isLocale, type Locale } from "@/lib/i18n";

type LanguageContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = "setuai_locale";

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (stored && isLocale(stored)) {
      const timeout = window.setTimeout(() => setLocaleState(stored), 0);
      return () => window.clearTimeout(timeout);
    }

    if (window.navigator.language.toLowerCase().startsWith("hi")) {
      const timeout = window.setTimeout(() => setLocaleState("hi"), 0);
      return () => window.clearTimeout(timeout);
    }

    return undefined;
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale === "hi" ? "hi" : "en";
    document.documentElement.dir = "ltr";
    window.localStorage.setItem(storageKey, locale);
  }, [locale]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      locale,
      setLocale: setLocaleState,
    }),
    [locale],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    return {
      locale: defaultLocale,
      setLocale: () => undefined,
    } satisfies LanguageContextValue;
  }
  return context;
}
