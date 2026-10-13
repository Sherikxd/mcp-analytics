import type { Locale } from "@/lib/i18n/dictionaries";

const TAGS: Record<Locale, string> = { es: "es-CO", en: "en-US" };

export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(TAGS[locale], { dateStyle: "medium" }).format(d);
}

export function formatDateTime(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(TAGS[locale], {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
