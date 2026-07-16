# LeadForge — Frontend (Next.js)

Admin dashboard for the LeadForge platform: leads pipeline, generated demo sites, email outreach, clients, and settings. Talks to the NestJS backend ([`leadforge-backend`](../leadforge-backend)) over REST.

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · Tailwind CSS 4 · shadcn/ui (Mira preset) · TanStack Table 8 · Recharts 3 · lucide-react · date-fns · TypeScript · **pnpm**.

## Pages

| Route | What it shows |
| --- | --- |
| `/` | Stats cards (leads, sites, emails, open/reply rate, clients, MRR), leads funnel chart, 12-month MRR trend, recent activity feed, quick actions (scrape / generate sites / start outreach) |
| `/leads` | Filterable, paginated leads table (URL-backed filters) with a slide-out detail sheet: timeline, site, outreach history, and actions (enrich, generate site, start outreach, convert to client) |
| `/sites` | Grid of generated demo sites with claimed/visited badges, preview + delete; template/claimed filters |
| `/outreach` | Campaign stats, per-lead sequence table with step indicators (sent/opened/clicked/replied), reply inbox tab, queue pause/resume |
| `/clients` | Client roster + MRR stats; `/clients/[id]` detail with AI services and social posts |
| `/settings` | Connection test, env reference, email + template info |

## Setup

```bash
cp .env.example .env.local    # NEXT_PUBLIC_API_BASE_URL (default http://localhost:3001)
pnpm install
pnpm dev                      # http://localhost:3000
```

Start the backend first (`pnpm start:dev` in `leadforge-backend`, and `pnpm db:seed` there for demo data).

## Structure

- `lib/api-client.ts` — typed fetch wrapper (`api.leads.list(...)`, unwraps the backend `{data, meta}` envelope)
- `lib/hooks/` — `useLeads`, `useSites`, `useOutreachStats`, `useClients`, … on a minimal SWR-style `useApi`
- `components/ui/` — shadcn/ui components; `components/shared/` — DataTable (TanStack), StatsCard, StatusBadge, EmptyState
- `components/layout/` — sidebar (icons on tablet, bottom nav on mobile) + breadcrumb header

## Commands

`pnpm dev` · `pnpm build` · `pnpm start` · `pnpm lint`

## Note for contributors (and AI agents)

This uses **Next.js 16** — `params`/`searchParams` are Promises and `useSearchParams` requires a `<Suspense>` boundary. Verify APIs against `node_modules/next/dist/docs/` rather than memory of older Next.js.
