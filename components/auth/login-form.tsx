"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/provider";

export function LoginForm() {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const value = token.trim();
    if (!value) {
      setError(dict.login.required);
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: value }),
      });
      if (!res.ok) {
        setError(dict.login.invalid);
        return;
      }
      router.push(`/${locale}`);
      router.refresh();
    } catch {
      setError(dict.login.invalid);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-sm border border-line bg-surface p-8"
    >
      <h1 className="text-xl font-semibold tracking-tight">{dict.login.title}</h1>
      <p className="mt-2 text-sm text-fg-muted">{dict.login.subtitle}</p>

      <label className="mt-6 block text-xs font-medium uppercase tracking-wider text-fg-subtle">
        {dict.login.token}
      </label>
      <input
        type="password"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        autoComplete="current-password"
        autoFocus
        className="mt-2 w-full border border-line bg-bg px-3 py-2.5 font-mono text-sm text-fg outline-none transition-colors focus:border-fg"
      />

      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 w-full bg-inverse px-4 py-2.5 text-sm font-medium text-inverse-fg transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {busy ? dict.common.loading : dict.login.submit}
      </button>
    </form>
  );
}
