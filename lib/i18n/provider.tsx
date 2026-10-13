"use client";

import { createContext, useContext, type ReactNode } from "react";
import { getDict, type Dictionary, type Locale } from "@/lib/i18n/dictionaries";

interface I18nValue {
  locale: Locale;
  dict: Dictionary;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dict: getDict(locale) }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const value = useContext(I18nContext);
  if (!value) {
    throw new Error("useI18n debe usarse dentro de <I18nProvider>");
  }
  return value;
}
