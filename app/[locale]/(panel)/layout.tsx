import { notFound } from "next/navigation";
import { connection } from "next/server";
import { CurrentYear } from "@/components/layout/current-year";
import { Sidebar } from "@/components/layout/sidebar";
import { requireSession } from "@/lib/auth/session";
import { isLocale } from "@/lib/i18n/dictionaries";

// El panel depende de cookies (sesión) y consultas en vivo: se renderiza
// en tiempo de petición, sin shell estática.
export const instant = false;

export default async function PanelLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  await connection();
  await requireSession();

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className="lg:pl-60">
        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
          <footer className="mt-12 border-t border-line pt-4 text-xs text-fg-subtle">
            <CurrentYear /> · mcp-analytics
          </footer>
        </main>
      </div>
    </div>
  );
}
