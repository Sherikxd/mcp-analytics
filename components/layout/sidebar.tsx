"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LocaleSwitcher } from "@/components/layout/locale-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useI18n } from "@/lib/i18n/provider";

const icons: Record<string, React.ReactNode> = {
  overview: (
    <path d="M3 3h7v7H3zM14 3h7v4h-7zM14 11h7v10h-7zM3 14h7v7H3z" />
  ),
  points: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  needs: (
    <>
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  activity: <path d="M22 12h-4l-3 9L9 3l-3 9H2" />,
  mcp: (
    <>
      <path d="M4 17l6-6-6-6M12 19h8" />
      <rect x="2" y="3" width="20" height="18" rx="2" />
    </>
  ),
};

interface NavItem {
  key: string;
  href: string;
  label: string;
}

export function Sidebar() {
  const { locale, dict } = useI18n();
  const pathname = usePathname();
  const router = useRouter();

  const items: NavItem[] = [
    { key: "overview", href: `/${locale}`, label: dict.nav.overview },
    { key: "points", href: `/${locale}/points`, label: dict.nav.points },
    { key: "needs", href: `/${locale}/needs`, label: dict.nav.needs },
    { key: "activity", href: `/${locale}/activity`, label: dict.nav.activity },
    { key: "mcp", href: `/${locale}/mcp`, label: dict.nav.mcp },
  ];

  function isActive(item: NavItem): boolean {
    if (item.key === "overview") return pathname === `/${locale}`;
    return pathname.startsWith(item.href);
  }

  async function signOut() {
    await fetch("/api/auth", { method: "DELETE" });
    router.push(`/${locale}/login`);
    router.refresh();
  }

  return (
    <>
      {/* Barra lateral (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-line bg-surface lg:flex">
        <div className="flex h-14 items-center gap-2.5 border-b border-line px-5">
          <span className="flex h-7 w-7 items-center justify-center bg-inverse font-mono text-xs font-bold text-inverse-fg">
            A
          </span>
          <span className="text-sm font-semibold tracking-tight">
            {dict.meta.title}
          </span>
        </div>

        <nav className="flex-1 space-y-0.5 p-3">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                isActive(item)
                  ? "bg-inverse font-medium text-inverse-fg"
                  : "text-fg-muted hover:bg-surface-2 hover:text-fg"
              }`}
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {icons[item.key]}
              </svg>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3 border-t border-line p-3">
          <div className="flex items-center justify-between px-1">
            <LocaleSwitcher locale={locale} />
            <ThemeToggle />
          </div>
          <button
            type="button"
            onClick={signOut}
            className="w-full px-3 py-2 text-left text-sm text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
          >
            {dict.nav.signOut}
          </button>
        </div>
      </aside>

      {/* Barra superior (móvil) */}
      <div className="sticky top-0 z-30 border-b border-line bg-surface lg:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center bg-inverse font-mono text-xs font-bold text-inverse-fg">
              A
            </span>
            <span className="text-sm font-semibold tracking-tight">
              {dict.meta.title}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher locale={locale} />
            <ThemeToggle />
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {items.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`whitespace-nowrap px-3 py-1.5 text-xs font-medium transition-colors ${
                isActive(item)
                  ? "bg-inverse text-inverse-fg"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={signOut}
            className="ml-auto whitespace-nowrap px-3 py-1.5 text-xs text-fg-subtle hover:text-fg"
          >
            {dict.nav.signOut}
          </button>
        </nav>
      </div>
    </>
  );
}
