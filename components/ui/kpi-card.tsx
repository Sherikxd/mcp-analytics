"use client";

import CountUp from "@/components/react-bits/CountUp";

export function KpiCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-fg-subtle">
        {label}
      </p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-fg tnum">
        <CountUp to={value} duration={1.2} separator="," />
      </p>
      {hint ? <p className="mt-1 text-xs text-fg-muted">{hint}</p> : null}
    </div>
  );
}
