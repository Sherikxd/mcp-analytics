"use client";

import SplitText from "@/components/react-bits/SplitText";

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <SplitText
        text={title}
        tag="h1"
        splitType="words"
        duration={0.5}
        delay={30}
        from={{ opacity: 0, y: 14 }}
        to={{ opacity: 1, y: 0 }}
        textAlign="left"
        className="text-2xl font-semibold tracking-tight text-fg"
      />
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">{subtitle}</p>
    </header>
  );
}
