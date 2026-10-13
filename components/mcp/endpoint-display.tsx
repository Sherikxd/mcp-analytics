"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => window.location.origin;
const getServerSnapshot = () => "https://tu-dominio.com";

export function EndpointDisplay({ path }: { path: string }) {
  const origin = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return (
    <code className="break-all border border-line bg-bg px-3 py-2 font-mono text-xs text-fg">
      {origin}
      {path}
    </code>
  );
}
