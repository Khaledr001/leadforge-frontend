# LeadForge Frontend — Claude Code guide

Next.js 16 (App Router) + React 19 + Tailwind 4 admin dashboard for LeadForge.
Package manager: **pnpm**. Calls the NestJS backend (`../leadforge-backend`) over
HTTP via `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:3001`).

## Commands
- `pnpm dev` — dev server (port 3000)
- `pnpm build` — production build
- `pnpm lint` — ESLint

## Layout & conventions
- App Router at the repo root: `app/` (there is **no** `src/`). Import alias `@/*` → `./*`.
- Tailwind 4 via `@tailwindcss/postcss` (`app/globals.css`, `postcss.config.mjs`).
- TypeScript strict; ESLint flat config (`eslint.config.mjs` + `eslint-config-next`).
- **Next.js 16 has breaking changes vs older versions.** Verify APIs against
  `node_modules/next/dist/docs/` before writing Next code — don't rely on memory
  of older Next.js.

## Don't read (generated / large — wastes context tokens)
`node_modules/`, `.next/`, `pnpm-lock.yaml`, `next-env.d.ts`, `public/*.svg`.
