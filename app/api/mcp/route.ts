import { timingSafeEqual } from "node:crypto";
import { createMcpHandler } from "mcp-handler";
import { registerAnalyticsTools } from "@/lib/mcp/tools";

const handler = createMcpHandler(
  (server) => {
    registerAnalyticsTools(server);
  },
  {
    serverInfo: { name: "mcp-analytics", version: "1.0.0" },
    verboseLogs: false,
  },
);

function tokensEqual(candidate: string, expected: string): boolean {
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function authorize(request: Request): Response | null {
  const expected = process.env.MCP_API_TOKEN;
  if (!expected) {
    return Response.json(
      { error: "MCP_API_TOKEN no está configurado en el servidor" },
      { status: 503 },
    );
  }

  const header = request.headers.get("authorization");
  if (!header || !header.startsWith("Bearer ")) {
    return new Response("Unauthorized", {
      status: 401,
      headers: { "WWW-Authenticate": 'Bearer realm="mcp"' },
    });
  }

  const token = header.slice(7).trim();
  if (!tokensEqual(token, expected)) {
    return new Response("Forbidden", {
      status: 403,
      headers: { "WWW-Authenticate": 'Bearer realm="mcp"' },
    });
  }
  return null;
}

async function handle(request: Request): Promise<Response> {
  const authError = authorize(request);
  if (authError) return authError;
  return handler(request);
}

export async function GET(request: Request) {
  return handle(request);
}

export async function POST(request: Request) {
  return handle(request);
}

export async function DELETE(request: Request) {
  return handle(request);
}
