export type BadgeKind = "neutral" | "ok" | "warn" | "danger" | "info";

const KIND_CLASS: Record<BadgeKind, string> = {
  neutral: "border-line-strong text-fg-muted",
  ok: "border-ok/40 text-ok",
  warn: "border-warn/40 text-warn",
  danger: "border-danger/40 text-danger",
  info: "border-info/40 text-info",
};

export function Badge({
  kind = "neutral",
  children,
}: {
  kind?: BadgeKind;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex items-center border px-1.5 py-0.5 text-[11px] font-medium uppercase tracking-wide ${KIND_CLASS[kind]}`}
    >
      {children}
    </span>
  );
}

export function pointStatusKind(status: string): BadgeKind {
  switch (status.toLowerCase()) {
    case "abierto":
    case "open":
      return "ok";
    case "temporal":
    case "temporary":
      return "warn";
    case "cerrado":
    case "closed":
      return "neutral";
    default:
      return "neutral";
  }
}

export function needUrgencyKind(urgency: string): BadgeKind {
  switch (urgency.toLowerCase()) {
    case "alta":
    case "high":
      return "danger";
    case "media":
    case "medium":
      return "warn";
    default:
      return "neutral";
  }
}

export function needStatusKind(status: string): BadgeKind {
  switch (status.toLowerCase()) {
    case "activa":
    case "active":
      return "ok";
    case "cubierta":
    case "covered":
      return "info";
    default:
      return "neutral";
  }
}
