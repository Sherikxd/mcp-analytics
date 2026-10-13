# mcp-analytics

Panel de analítica (negro/blanco, sin frutas decorativas) para la plataforma de ayuda, con servidor MCP para que una IA consulte los datos en vivo desde Supabase. Arquitectura serverless lista para Vercel.

## Stack

- Next.js 16 (App Router, Cache Components) + TypeScript
- Tailwind CSS v4
- Chart.js + react-chartjs-2
- Componentes React Bits (CountUp, FadeContent, SplitText, AnimatedContent) bajo `components/react-bits/`
- Supabase (`@supabase/supabase-js`) — lecturas con la anon key
- `mcp-handler` + `@modelcontextprotocol/server` (spec MCP 2026-07-28, stateless, sin Redis)

## Estructura

```
app/
  [locale]/                 # i18n por ruta: /es/..., /en/...
    layout.tsx              # root layout (html/body, tema, idioma)
    login/page.tsx          # acceso por token
    (panel)/                # panel protegido (sesión por cookie)
      page.tsx              # resumen (KPIs + charts)
      points/ needs/ activity/ mcp/
  api/
    auth/route.ts           # login (POST token) y logout (DELETE)
    analytics/[view]/route.ts  # JSON: overview | points | needs | activity
    mcp/route.ts            # servidor MCP (/api/mcp)
lib/
  auth/session.ts           # token + cookie httpOnly (comparación timing-safe)
  supabase/server.ts        # cliente Supabase (service_role si existe, si no anon)
  analytics/                # esquema, consultas acotadas y agregaciones
  mcp/tools.ts              # tools del servidor MCP
  i18n/                     # diccionarios es/en + provider
components/
  charts/ ui/ layout/ tables/ react-bits/ mcp/
proxy.ts                    # locale + guard del panel
```

## Variables de entorno

Copia `.env.example` a `.env.local` y completa:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública (lecturas con RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | Opcional. Solo servidor; se usa si está presente |
| `PANEL_ACCESS_TOKEN` | Token de acceso al panel (genera: `openssl rand -hex 24`) |
| `MCP_API_TOKEN` | Token bearer del endpoint MCP (genera uno propio) |

En producción, configúralas en Vercel (Settings → Environment Variables). `.env.local` y `.env*` no se commitean (solo `.env.example`).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npm run build
npm run start
```

1. Abre `http://localhost:3000` → redirige a `/es/login`.
2. Introduce `PANEL_ACCESS_TOKEN` → se guarda en cookie httpOnly (7 días).
3. El proxy y el layout del panel validan la sesión en cada petición.

## API JSON (protegida)

Cabecera `Authorization: Bearer <PANEL_ACCESS_TOKEN>` o cookie de sesión:

```
GET /api/analytics/overview?locale=es
GET /api/analytics/points | needs | activity
```

## Servidor MCP

- Endpoint: `https://<tu-dominio>/api/mcp` (Streamable HTTP)
- Auth: `Authorization: Bearer <MCP_API_TOKEN>`

Tools expuestas:

| Tool | Descripción |
|---|---|
| `get_schema` | Tablas, columnas, tipos y conteos |
| `query_metrics` | `totals` (globales+KPIs), `breakdown` (tabla+columna), `series` (día/mes) |
| `query_table` | Filas con filtros acotados (whitelist de tablas/columnas, ops eq/neq/gte/lte/like/ilike, limit ≤ 500) |
| `generate_report` | Informe de texto con KPIs, desgloses y tendencia (es/en) |

No hay SQL crudo: todas las consultas pasan por el registro de esquema (`lib/analytics/schema.ts`).

Ejemplo de conexión desde un cliente MCP (Cursor, Claude, etc.):

```json
{
  "mcpServers": {
    "analytics": {
      "url": "https://<tu-dominio>/api/mcp",
      "headers": { "Authorization": "Bearer <MCP_API_TOKEN>" }
    }
  }
}
```

O con `mcp-remote` para clientes solo-stdio:

```bash
npx -y mcp-remote https://<tu-dominio>/api/mcp --header "Authorization: Bearer <MCP_API_TOKEN>"
```

## Despliegue en Vercel

1. Importa el repo en Vercel (framework detected: Next.js).
2. Configura las variables de entorno de la tabla anterior.
3. Deploy. `/api/mcp` y las rutas del panel funcionan como funciones serverless (Fluid compute recomendado).

## Notas

- La base expone: `help_points`, `help_needs`, `need_supporters`, `point_comments`, `entity_reports`. Si añades tablas, regístralas en `lib/analytics/schema.ts` (el panel y el MCP solo consultan lo registrado).
- Diseño monócromo con tema claro/oscuro (toggle en la barra lateral); los acentos de color se reservan para estados (urgencia, badges).
- i18n: español por defecto, inglés disponible desde el selector del panel.
