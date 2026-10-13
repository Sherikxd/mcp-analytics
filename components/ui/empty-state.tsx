export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex min-h-32 flex-col items-center justify-center border border-dashed border-line px-6 py-8 text-center">
      <p className="text-sm font-medium text-fg-muted">{title}</p>
      {hint ? <p className="mt-1 max-w-sm text-xs text-fg-subtle">{hint}</p> : null}
    </div>
  );
}
