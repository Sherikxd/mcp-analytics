"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALES, type Locale } from "@/lib/i18n/dictionaries";

export function LocaleSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  function hrefFor(target: Locale): string {
    const segs = pathname.split("/");
    if (LOCALES.includes(segs[1] as Locale)) {
      segs[1] = target;
      return segs.join("/") || `/${target}`;
    }
    return `/${target}${pathname}`;
  }

  return (
    <div className="flex border border-line">
      {LOCALES.map((l) => (
        <Link
          key={l}
          href={hrefFor(l)}
          className={`px-2 py-1 text-xs font-medium uppercase transition-colors ${
            l === locale
              ? "bg-inverse text-inverse-fg"
              : "text-fg-muted hover:text-fg"
          }`}
        >
          {l}
        </Link>
      ))}
    </div>
  );
}
