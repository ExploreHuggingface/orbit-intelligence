# ORBIT Intelligence

**Your next opportunity is out there.** ORBIT is a B2C SaaS internet-intelligence platform: it continuously searches marketplaces and the web for products, properties, investments and rare items, scores what matches your criteria against estimated reference values, tracks availability, and alerts you before the market does.

This is a complete, working build: marketing site (17+ routes), real email/password auth, an authenticated app with 13 fully wired pages, a local SQLite backend with deterministic demo seed data, and a ready-to-apply Supabase/Postgres production path.

---

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

No configuration needed. The app runs on a **local SQLite backend** (`.orbit-local/orbit.db`), created and seeded automatically on first request. Sign up with any email/password (min 8 chars) — your workspace arrives preloaded with 6 monitors, 48 sample opportunities, 15 notifications, 4 collections and 20 activity events so every page has content on first login.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (must pass with zero TS/lint errors) |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` (strict) |
| `npm run lint` | ESLint |
| `npm test` | Vitest unit tests |
| `npx tsx scripts/smoke-db.ts` | Backend smoke test (seed, search, auth, analytics) |
| `npx tsx scripts/generate-supabase-seed.ts` | Regenerate `supabase/migrations/0002_seed.sql` from the TS seed |

**Demo data disclaimer:** all seeded records carry `is_sample: true` and render a “Sample data” badge. Reference values, yields and savings figures are labeled *illustrative estimates* everywhere they appear. Nothing in the UI claims live crawling, verified savings or guaranteed returns — because none of that is true *yet* (see [Honesty boundaries](#honesty-boundaries)).

---

## What’s inside

### Marketing site (`/`)
Landing page (hero with a live product-preview composite, value props, product tour, use cases, capability stats, testimonials, CTAs), 6 feature detail pages, use-case index + 3 persona pages, pricing with monthly/annual toggle and an honest billing waitlist, about, working contact form, blog (MDX) with 3 seed posts, privacy, terms, styled 404. SEO: per-route metadata, `sitemap.ts`, `robots.ts`, OG image, JSON-LD.

### App (`/app/*`, authenticated)
| Page | Highlights |
|---|---|
| Overview | KPI cards with sparklines (DB-computed), discovery search panel, opportunities table with sort/search/pagination, detail drawer with price chart + yield analysis, market charts with 7/30/90-day ranges, activity feed, right context panel |
| Discover | URL-param search + category-adaptive filter rail (yield, price/m², neighborhoods…), grid/table views, save-search, empty states |
| Opportunities | Status tabs with counts, row selection + bulk actions, detail page with confidence drivers and evidence links |
| Monitors | 4-step create/edit wizard (state preserved between steps), pause/resume, delete with 5-second Undo, plan-limit gating with upgrade path |
| Collections | Create/delete, add/remove items with undo, plan gating |
| Comparisons | Search-select 2–4 items, best-value-per-row highlight, real-estate rows (yield, rent, price/m²) |
| Notifications | Type tabs, mark-read on click + navigate, mark-all-read, unread sync with topbar bell |
| Market Insights | 30/90/180-day range selector driving trend cards, multi-series area chart, volume donut, top movers |
| Price History | Searchable tracked list with sparklines, annotated full-history chart + observation timeline |
| Video Reviews | Card grid with category filter + search, clearly-labeled illustrative external links |
| Activity | Full chronological feed with record links |
| Integrations | Every card honestly marked “Not yet connected” + request-integration modal |
| Settings | Profile, Workspace, Notifications, Data (JSON export + demo reset), Plan (usage meters + waitlist) |
| Onboarding | Interests → first monitor (prefilled wizard) → done; skipped once `onboarded_at` is set |

### Auth
Split-screen login/signup/forgot/reset pages, scrypt password hashing, HMAC-signed HTTP-only session cookies (Web Crypto — verifiable in edge middleware), route protection with redirect-back-after-login, sign-out via server action, stale-cookie recovery route that breaks redirect loops.

---

## Architecture

```
Next.js 15 (App Router, React 19, TS strict, Tailwind CSS 4)
│
├── app/(marketing)/      public site — Server Components by default
├── app/(auth)/           split-screen auth pages
├── app/(app)/app/        authenticated app — every page a Server Component
│
├── lib/data/*            THE data-access contract (search, monitors, collections,
│                         activity, analytics, misc) — pages never touch a DB client
├── lib/db/*              local SQLite driver (better-sqlite3) + deterministic seed
├── lib/supabase/*        production Supabase client helpers
├── lib/actions/*         server actions (auth, app mutations) — Zod-validated
├── lib/validations/*     shared Zod schemas
├── lib/auth/*            session cookies (edge-safe) + password hashing (Node)
├── middleware.ts         session guard for /app/*, auth-page bounce
│
├── components/easyui/    EasyUI component library (vendored from
│                         github.com/Surajmaurya1/easyui), tokenized to the
│                         ORBIT palette — charts, tables, sidebar, bell, forms…
├── components/ui/        ORBIT primitives (cards, badges, DataTable, Modal…)
├── components/app/*      app feature components
├── components/marketing/* marketing sections
├── content/blog/*.mdx    blog posts (gray-matter + next-mdx-remote)
└── supabase/migrations/  production Postgres schema, RLS, seed
```

**State discipline:** all entity data is server-rendered from the database; URL params own list/filter state (shareable, back/forward works); Zustand (`orbit.ui`) holds only UI preferences (sidebar collapse); Sonner toasts fire on every mutation; destructive actions offer Undo.

**Design system:** tokens live in `app/globals.css` as CSS variables (achromatic chrome, brand pink `#EC4899` reserved for brand/active/data, semantic colors only in charts and status). EasyUI’s variable names are aliased onto the ORBIT palette so every vendored component renders on-brand without modification. Tabular numerals on every price, score and count. Light theme only — the `dark:` variant is class-scoped and never activated.

## Backend drivers

| Mode | When | Storage |
|---|---|---|
| **Local (default)** | no Supabase env vars | SQLite at `.orbit-local/orbit.db` |
| **Supabase** | env vars set | Postgres via `lib/supabase/*` |

Both return the shapes in `lib/types.ts`, so pages don’t change when the driver swaps. See `lib/db/README.md` for the full contract, the RLS policies in `supabase/migrations/0001_schema.sql`, and `.env.local.example` for configuration.

## Honesty boundaries (by design, per spec)

- **No live crawling yet.** The product runs on curated sample data; the crawler (Firecrawl/Apify/Playwright tiers) is future work. Monitors say “simulated until crawling is connected”.
- **Estimates are estimates.** Reference values, deal scores, yields and savings are labeled illustrative everywhere; the opportunity page links its evidence.
- **No payments.** Pricing CTAs open a “Billing goes live at launch” modal that captures waitlist emails (stored in `contact_messages`) — never a fake checkout.
- **Email delivery comes with launch.** Notification toggles exist and are labeled.
- **Integrations are “Not yet connected.”** Request-integration captures interest; no card implies a live connection.

## Testing

- `npx tsx scripts/smoke-db.ts` — 30 assertions covering seed integrity, search filters (including impossible queries), monitor/collection CRUD, notifications, KPIs, chart series, plan lookup, and session/password crypto.
- `npm test` — Vitest unit tests for formatting utilities and validation schemas.
- Manual pass: the full §38 functionality gate was exercised in a real browser during the build (signup → onboarding → wizard → all 13 app pages → marketing sweep → pricing toggle → waitlist persistence).

## Production checklist

1. Set `ORBIT_SESSION_SECRET` (any local-auth deployment) and `NEXT_PUBLIC_SITE_URL`.
2. Create a Supabase project, run both migrations, set the Supabase env vars.
3. Implement `lib/data/*` against the Supabase client (helpers shipped in `lib/supabase/`).
4. Have counsel review `/privacy` and `/terms` (they’re honest templates, not legal advice).
5. `npm run build` — must pass clean.
