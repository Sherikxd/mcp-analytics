import { EndpointDisplay } from "@/components/mcp/endpoint-display";
import { PageHeader } from "@/components/ui/page-header";
import { PanelCard } from "@/components/ui/panel-card";
import { getDict, isLocale } from "@/lib/i18n/dictionaries";

const EXAMPLE = `{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "query_metrics",
    "arguments": { "metric": "totals" }
  }
}`;

export default async function McpPage(props: PageProps<"/[locale]/mcp">) {
  const { locale } = await props.params;
  if (!isLocale(locale)) return null;
  const dict = getDict(locale);
  const m = dict.mcp;

  return (
    <div>
      <PageHeader title={m.title} subtitle={m.subtitle} />

      <div className="grid gap-4 lg:grid-cols-2">
        <PanelCard title={m.url} hint={m.connectHint}>
          <EndpointDisplay path="/api/mcp" />

          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-fg-subtle">
            {m.auth}
          </p>
          <p className="mt-1 text-xs text-fg-muted">{m.authHint}</p>
          <code className="mt-2 inline-block border border-line bg-bg px-3 py-2 font-mono text-xs text-fg">
            Authorization: Bearer &lt;MCP_API_TOKEN&gt;
          </code>

          <p className="mt-4 text-xs font-medium uppercase tracking-wider text-fg-subtle">
            {m.exampleBody}
          </p>
          <pre className="mt-2 overflow-x-auto border border-line bg-bg p-3 font-mono text-xs leading-relaxed text-fg-muted">
            {EXAMPLE}
          </pre>
        </PanelCard>

        <PanelCard title={m.toolsTitle}>
          <ul className="divide-y divide-line">
            {m.tools.map((tool) => (
              <li key={tool.name} className="py-3">
                <p className="font-mono text-sm font-medium text-fg">{tool.name}</p>
                <p className="mt-0.5 text-xs text-fg-muted">{tool.description}</p>
              </li>
            ))}
          </ul>
        </PanelCard>
      </div>
    </div>
  );
}
