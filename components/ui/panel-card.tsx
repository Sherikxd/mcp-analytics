import type { ReactNode } from "react";

export function PanelCard({
  title,
  hint,
  action,
  children,
  className = "",
  bodyClassName = "p-4",
}: {
  title?: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`border border-line bg-surface ${className}`}>
      {title ? (
        <div className="flex items-baseline justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 className="text-sm font-medium text-fg">{title}</h2>
            {hint ? <p className="mt-0.5 text-xs text-fg-subtle">{hint}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
