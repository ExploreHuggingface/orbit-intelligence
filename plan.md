# ORBIT Intelligence — Full-Scale SaaS Build Plan

**Version 3.0 — Marketing Site + App + Backend, optimized for agentic coding (Cursor)**

---

## How to Use This Document in Cursor

This is a **complete build specification**, not a feature list. It is ordered the way you will execute it: product thesis → architecture → design system → marketing site → app pages → implementation phases → acceptance criteria.

**Rules of engagement for the agent:**

1. **Build strictly phase by phase** (Part X). Do not start a phase until the previous phase's "Done when" checklist passes.
2. **Run the verification command after every phase:** `npx tsc --noEmit && npm run lint && npm run build`. Fix all errors before moving on.
3. **Stay inside the phase's file list.** When editing a file outside the current phase, only change what the phase requires.
4. **Never ship dead UI.** No `<a href="#">`, no buttons without `onClick`, no inert search forms, no disabled buttons without an explanation tooltip/label.
5. **Never hardcode colors/sizes in components.** Use the design tokens in Part III (`--color-*`, spacing scale, type scale).
6. **Demo/seed records keep `is_sample: true`** and must render the sample-data badge. No UI text may claim live crawling, verified savings, or guaranteed returns.
7. **Prefer deleting dead code over leaving commented-out code.**

`plan.txt` is the historical v2 prototype spec. It stays untouched for reference; **`plan.md` is the source of truth.**

---

# Part I — Product Thesis & Scope

## 1. What ORBIT Is

**ORBIT Intelligence** is a B2C SaaS internet-intelligence platform. It continuously searches the web for products, properties, investments, rare items, price drops, and emerging opportunities. Users describe what they want in natural language; ORBIT finds matching listings across marketplaces, compares prices against estimated reference values, tracks availability, scores each match, and notifies users when new results appear.

The product sits between three categories that are usually separate:

| Category | What it provides | What it lacks |
|---|---|---|
| **Search engine** | Discovery | No persistence, no monitoring, no evaluation |
| **CRM** | Organization and workflow | No autonomous discovery |
| **Market intelligence** | Analysis | No personal, actionable opportunity tracking |

ORBIT is the **operational layer** that turns passive web search into an active opportunity pipeline. It is a command center, not a chatbot. Every interaction produces a structured record — a monitor, an opportunity, a collection, a comparison, a notification — not a conversation transcript.

## 2. Who Uses It and Why

The primary user is a **high-intent individual operator** — an investor, collector, restorer, or deal-hunter who currently manages discovery across spreadsheets, browser bookmarks, and manual marketplace checks. They pay $49–$299/month because a single missed opportunity costs more than a year of subscription.

**Representative workflows (reuse this language across marketing copy and seed data):**

- **Real estate investor:** apartments in Berlin-Friedrichshain under €350k with estimated gross yield above 5.5%. ORBIT monitors sources continuously, scores each new listing, and pushes a notification with the deal analysis computed.
- **Porsche restorer:** an OEM 911 (997) headlight that appears on forums and sells within hours. ORBIT watches sources, matches part number and condition, alerts while the listing is still live.
- **Watch collector:** an Omega Seamaster below €4,000 in excellent condition with box and papers. ORBIT compares each listing to a reference price band and flags meaningful outliers.

## 3. Product Surfaces

| Surface | Path group | Audience | Status in this build |
|---|---|---|---|
| **Marketing website** | `/` (marketing routes) | Anonymous visitors | Fully built, SEO-ready |
| **Auth** | `/login`, `/signup`, `/forgot-password` | Anonymous | Supabase auth, real |
| **App** | `/app/*` | Authenticated users | Fully built, DB-backed |
| **Legal** | `/privacy`, `/terms` | Everyone | Static, real content |

## 4. Scope Boundaries

**In scope:**
- Complete marketing site (landing, features, use cases, pricing, about, contact, legal).
- Complete authenticated app (13 page specs, Part VI), backed by Supabase Postgres with real CRUD via Server Actions / route handlers.
- Real authentication (Supabase email + OAuth), route protection, session handling.
- Seed data with demo monitors/opportunities so every page has content on first login.
- Plan/usage gating UI (Stripe integration deferred).

**Out of scope (explicitly labeled in UI where relevant):**
- Live web crawling / scraping pipeline (the *product* runs on seeded + user-created records; crawling is future work — see Part II §6).
- Real price verification or AI inference — reference values are labeled "Illustrative estimate".
- Payment processing: pricing page and upgrade buttons render fully but checkout shows "Billing goes live at launch" honesty modal.
- Email delivery: notification toggles exist but show "Email requires account verification — coming soon" where not functional.
- Blog content beyond 3 seed posts (the blog system itself is built).

**The simulation boundary is a design requirement, not an apology.**

---

# Part II — Technical Architecture

## 5. Stack

| Layer | Technology | Rationale |
|---|---|---|
| Framework | **Next.js 15 (App Router)** + React 19 | Server Components, Server Actions, route groups, file conventions, SEO for marketing site |
| Language | **TypeScript 5+ (strict)** | Non-negotiable at this size |
| Styling | **Tailwind CSS 4** + CSS custom properties for tokens | Utility-first; tokens live in CSS so they cascade to charts and marketing |
| Components | **shadcn/ui + Radix** | Accessible primitives, no runtime lock-in, easy to restyle to our tokens |
| Server state (client) | **TanStack Query 5** | Only for data fetched from client components; most data should be server-rendered |
| Client state | **Zustand 5** | UI-only: sidebar collapsed, view mode, open panels, selected comparison IDs. Never server data |
| Forms | **React Hook Form + Zod** | Monitor wizard, contact form, settings, filters |
| DB + Auth | **Supabase** (Postgres, Auth, RLS, Storage) | Fastest credible SaaS backend; typed client, row-level security |
| DB access (server) | **`@supabase/ssr`** + Server Actions / route handlers | Server Components read directly; mutations go through Server Actions |
| Validation | **Zod** shared between forms and server actions | One schema, both sides |
| Charts | **Recharts** | Composable, responsive, tooltip support |
| Icons | **Lucide React** | Consistent stroke system, 1.75 stroke, never emoji |
| Toasts | **Sonner** | Accessible, stacked |
| MDX (blog) | **`next-mdx-remote` or Contentlayer-style setup** | Blog posts as MDX files |
| Testing | **Vitest + React Testing Library + Playwright (smoke)** | Unit/component + a few e2e happy paths |
| SEO / perf | `next/metadata`, `next/image`, `sitemap.ts`, `robots.ts` | Built into Next |

**State discipline (architectural rule):**
- **Server Components** fetch list/detail data directly from Supabase — no client fetch needed for initial render.
- **TanStack Query** only for interactive client data (search-as-you-type, drawer content after navigation, polling-free refetches).
- **Zustand** only for pure UI state, persisted under `orbit.ui`.
- Never cache DB rows in Zustand. Never put UI preferences in the query cache.

## 6. Crawling Architecture (Design-Only, Future Phase)

Documented so schema and service contracts don't need rewriting later. **Not built now.**

- **Tier 1 — General web intelligence:** Firecrawl (`/search`, `/extract` with natural-language schemas) for breadth.
- **Tier 2 — Marketplace-specific:** Apify Actors for Amazon, eBay, Zillow, ImmobilienScout24, Chrono24, Kleinanzeigen.
- **Tier 3 — Custom JS/anti-bot:** Playwright + Crawlee for portals with XHR-driven results and WAFs.

**Pipeline:** `monitor criteria → job queue (pg_cron / Inngest later) → fetch → normalize → LLM schema-constrained extraction with gleaning → embeddings → hybrid vector+keyword retrieval → rerank → hard filters → score → notify`.

**Service contract is stable across prototype→production:** the app's data-access modules (`lib/data/*.ts`) return the same shapes today (from Postgres) and tomorrow (from an API + crawler).

## 7. Database Schema (Supabase / Postgres)

Run as migrations in `supabase/migrations/`. Enable RLS on **every** table; policies scope rows to `auth.uid()` via `user_id` or via `org_members`.

```sql
-- Core identity
profiles        id (uuid, = auth.users.id), email, full_name, avatar_url,
                timezone, created_at
plans           code (free|pro|scale), name, monitor_limit, price_monthly_eur
subscriptions   user_id, plan_code, status, current_period_end   -- seeded, Stripe later

-- Opportunity data
opportunities   id (uuid), user_id (nullable for global seed), title, description,
                category (enum), image_url, source_marketplace, source_url,
                current_price (numeric), currency, previous_price, estimated_market_value,
                price_change_pct, deal_score (int), match_score (int),
                status (enum new|shortlisted|under_review|dismissed|purchased|completed),
                discovered_at, last_checked_at, is_sample (bool),
                attributes (jsonb), real_estate (jsonb), evidence_links (text[])
price_history   id, opportunity_id, date, price

-- Monitoring
monitors        id, user_id, name, description (text), category, criteria (jsonb),
                sensitivity (broad|balanced|strict), frequency_minutes,
                notify_in_app (bool), notify_email (bool), digest_mode (bool),
                price_drop_only (bool), status (active|paused), match_count (int),
                last_checked_at, created_at
collections     id, user_id, name, created_at
collection_items collection_id, opportunity_id, added_at
comparisons     id, user_id, opportunity_ids (uuid[]), created_at  -- optional persistence

-- System
notifications   id, user_id, type (price_drop|new_match|availability|monitor_update),
                title, body, opportunity_id, monitor_id, is_read, created_at
activity_events id, user_id, kind, payload (jsonb), created_at
searches        id, user_id, query, category, created_at          -- recent queries
contact_messages id, name, email, company, message, created_at    -- public insert only
```

**Enums** for `category`, `status`, `notification type` etc. keep the app honest; seed via migration.

**RLS rules (minimum):**
- User-owned tables: `auth.uid() = user_id`.
- `opportunities`: global seed rows have `user_id IS NULL` and are readable by all authenticated users; user-created/disposition rows are owner-only.
- `contact_messages`: `INSERT` allowed to `anon`, no `SELECT` for anon.
- `subscriptions`: readable by owner; writable only by service role (future Stripe webhook).

## 8. Data-Access Layer (The Contract)

**Components never touch `supabase.from(...)` directly outside `lib/`.** All access goes through `lib/data/*`:

```
lib/data/
  search.ts        → searchOpportunities(q, filters, page), getSuggestions(q), getRecentQueries()
  opportunities.ts → list(filters), getById(id), updateStatus(id, status), bulkUpdate(ids, status), getHistory(id)
  monitors.ts      → list(), getById(id), create(payload), update(id), pause(id), resume(id), remove(id)
  collections.ts   → list(), create(name), addItem(), removeItem()
  notifications.ts → list(), markRead(id), markAllRead(), getUnreadCount()
  activity.ts      → list(filters), log(kind, payload)
  analytics.ts     → getDiscoveries(range), getPriceDropsByCategory(range),
                     getDealScoreDistribution(range), getMarketVsListing(range)
  billing.ts       → getPlanForUser(userId)  -- returns seeded subscription; Stripe later
```

- Each function takes an explicit Supabase server client (from `lib/supabase/server.ts`) — required for Server Components and Server Actions.
- Every mutation also writes an `activity_events` row.
- List functions return typed rows + `count` for pagination.
- **Future crawler writes through the same schemas** — no page-level rewrites.

## 9. Auth & Route Protection

- `middleware.ts` refreshes Supabase cookies and guards `/app/*` (redirect to `/login?next=...`) and redirects authenticated users away from `/login`, `/signup`.
- Providers: Email/password + Google OAuth (configure in Supabase; if credentials absent, email-only and OAuth button hidden — never render a button that errors).
- Sign-out is a Server Action that signs out then redirects to `/`.
- Profile row is created by a `on_auth_user_created` DB trigger.

---

# Part III — Design System

## 10. Visual Language

**Direction (from `sample.jpeg`): precision-engineered, dense, white, analytics-first.** The screen is a working instrument: crisp white cards on a near-white canvas, a light left rail, one focused content column, an always-available right detail panel, and charts where color only encodes meaning. Quality bar: Attio, Linear, Stripe, and the margin dashboard in the reference image.

Principles:
1. **Achromatic chrome, chromatic data.** Navigation, cards, buttons, and borders are neutral. Pink/green/blue/amber appear only in charts, status, and score bars.
2. **Density with air.** 13–14px body, tight table rows (44px), but consistent 16/20/24px card padding and clear section rhythm.
3. **Hierarchy via weight and tracking**, not giant type. Page titles stay modest (24–28px).
4. **Borders over shadows.** 1px borders define structure; shadows only for overlays (dropdowns, drawers, modals).

## 11. Color Tokens

No component hardcodes hex values. Define in `app/globals.css` as CSS variables (light theme only; dark is out of scope).

| Token | Value | Role |
|---|---|---|
| `--color-canvas` | `#F6F7F9` | Page background |
| `--color-surface` | `#FFFFFF` | Cards, sidebar, topbar |
| `--color-surface-subtle` | `#FAFAFB` | Table headers, nested surfaces |
| `--color-ink` | `#101319` | Primary text / headings |
| `--color-ink-secondary` | `#5B6472` | Secondary text |
| `--color-ink-tertiary` | `#98A0AD` | Captions, placeholders |
| `--color-accent` | `#101319` | **Primary actions are near-black** (sample-style), not colorful |
| `--color-brand` | `#EC4899` | Brand accent: logo mark, active nav dot, key chart series |
| `--color-brand-subtle` | `#FDF0F6` | Active nav / brand wash |
| `--color-border` | `#E8EAEE` | Card borders, dividers, inputs |
| `--color-border-strong` | `#D5D9E0` | Hover/emphasized borders |
| `--color-positive` | `#12B76A` | Up-trends, on-target, savings |
| `--color-negative` | `#F04438` | Price increases, alerts, risk |
| `--color-warning` | `#F79009` | Caution, expiring, "at risk" |
| `--color-info` | `#2E90FA` | Neutral info series |
| `--color-violet` | `#7A5AF8` | 4th chart series |
| `--color-overlay` | `rgba(16,19,25,0.45)` | Modal/drawer scrim |

**Chart palette (ordered, use in this order):** `--color-brand` → `--color-positive` → `--color-info` → `--color-violet` → `--color-warning`.

**Rules:** primary buttons are near-black `#101319` with white text; the brand pink is reserved for brand/active/data. Status badges = semantic color at 10% background + full-strength text. Never use red/green as decoration.

## 12. Typography

**Typeface:** Inter Variable, `font-feature-settings: "cv05","ss03"` for UI; `font-variant-numeric: tabular-nums` on every price, score, count, and percentage.

| Role | Size | Weight | Tracking | Line height |
|---|---|---|---|---|
| Display / Marketing H1 | 48–56px | 600 | -0.03em | 1.05 |
| Page H1 | 24px | 600 | -0.02em | 1.25 |
| H2 / Section | 18px | 600 | -0.01em | 1.3 |
| H3 / Card title | 14–15px | 600 | -0.005em | 1.4 |
| Body | 14px | 500 | -0.006em | 1.5 |
| Table cell / Small | 13px | 500 | 0 | 1.45 |
| Caption / Label | 12px | 500 | 0.01em | 1.4 |
| Data / Mono price | 13px | 600 | 0 | tabular-nums |
| KPI value | 28–32px | 600 | -0.02em | 1.1 |

Marketing body text: 16–18px, `--color-ink-secondary`, max-width ~640px for prose.

## 13. Spacing, Radius, Elevation

- **4px base unit.** Component padding: 12 (compact) / 16 (default) / 20 (comfortable) / 24 (section).
- **Radius:** cards 12px, buttons 8px, inputs 8px, badges 999px (pill), images 8px. No over-rounding.
- **Border:** 1px everywhere.
- **Shadow scale:**
  - `--shadow-xs: 0 1px 2px rgba(16,19,25,0.05)` (cards on hover)
  - `--shadow-sm: 0 2px 6px rgba(16,19,25,0.06)` (dropdowns)
  - `--shadow-lg: 0 12px 32px rgba(16,19,25,0.12)` (modals/drawers)

## 14. Layout System

**App (`/app/*`):**
- Left rail: **240px** expanded / **64px** collapsed (persisted in `orbit.ui`), white, 1px right border.
- Topbar: **56px**, breadcrumb left; date-range/slot actions, notification bell, avatar right.
- Content: `max-width: 1440px`, padding 24–32px.
- Preferred dashboard composition (from the sample): **main column (charts + tables) + 360px right context panel** on ≥1280px; the panel stacks below content under 1280px.

**Marketing:** centered container `max-width: 1200px`, 12-column grid, section vertical rhythm 96–120px.

**Breakpoints:** `<768` mobile, `768–1279` tablet, `≥1280` desktop, `≥1536` wide. No horizontal overflow at 375 / 768 / 1440.

## 15. Component States & Patterns

Every interactive element defines: **default, hover, focus-visible, active, disabled, loading**. Focus ring: 2px `--color-brand` (or ink) at 2px offset. Buttons show spinner + disabled while pending (`useTransition`/`formAction`).

- **Tables:** 44px rows, sticky header, hover row `--color-surface-subtle`, sortable headers with caret, skeleton rows (3–5) on load.
- **Empty states:** Lucide icon (18–20px, tertiary) + one-line explanation + primary action.
- **Errors:** inline card with retry, preserves user input. Dev-only simulation via `?simulateError=1`.
- **Badges:** 11px uppercase, 10% tinted background. Never color-dot-only.
- **Tooltips:** on info icons, truncated text, disabled explanations.
- **Icons:** Lucide, 16/18px, stroke 1.75. **No emoji anywhere.**

---

# Part IV — Marketing Website (Public, SEO)

All marketing routes live in `app/(marketing)/` with a shared `MarketingLayout` (header + footer). Server Components by default; interactivity via small client islands.

## 16. Header & Footer

**Header (sticky, blurred white at `rgba(255,255,255,0.8)` + `backdrop-blur`):**
- Left: ORBIT mark (orbital glyph in brand pink) + wordmark.
- Center nav: **Product** (dropdown → Features overview), **Use Cases** (dropdown → Real Estate / Collectors / Deal Hunters), **Pricing**, **Blog**, **About**.
- Right: "Sign in" (text) + "Start free" (near-black primary).
- Mobile: hamburger → full-screen sheet with same links + CTAs.
- Scroll behavior: 1px bottom border appears after 8px scroll.

**Footer (4 columns + bottom bar):**
- Product: Features, Pricing, Changelog (→ blog tag), Roadmap (→ contact).
- Use Cases: Real Estate, Watches & Collectors, Cars & Parts.
- Company: About, Blog, Contact, Careers (→ contact with subject prefilled).
- Legal: Privacy, Terms, (Cookie notice text in bottom bar).
- Bottom bar: © 2026 ORBIT Intelligence, "Made for operators who move first", social icons (GitHub/X/LinkedIn — links to `#` are forbidden; omit until real URLs exist).

## 17. Landing Page (`/`)

Section by section — every word matters, write final copy in build:

1. **Hero**
   - Eyebrow pill: "Internet intelligence for operators" with a live-dot.
   - H1: **"Your next opportunity is out there."**
   - Sub: **"ORBIT continuously scans marketplaces and the web, scores what matches your criteria, and alerts you before the market does."**
   - Dual CTA: "Start free" (primary) + "See how it works" (ghost → `/features`).
   - Trust line: "No credit card required · 3 monitors free · Cancel anytime".
   - **Hero visual:** a framed, borderless product screenshot composite rendered as real components (build a static `<ProductPreview/>` using the actual dashboard card components with fake static props — sharper and on-brand than a PNG). Rounded 12px, `--shadow-lg`, subtle top gradient mask.

2. **Logo bar** — "Trusted by independent investors and sourcing teams" + 6 wordmark placeholders rendered as neutral text marks (not fake company logos).

3. **Value props (3-up)** —
   - "Monitor anything" / "Describe what you want in plain language…"
   - "Scored against reference values" / "Every match arrives with price context…"
   - "Alerted in real time" / "In-app notifications the moment a match appears…"

4. **Product showcase — alternating 2-up rows (3 rows)**: Discover (search + filters), Evaluate (deal score panel), Monitor (alert feed). Each: heading, 2-line body, 3 checkmark bullets, and a cropped product visual built from real components.

5. **How it works (3 steps)** — numbered: 1 Describe → 2 ORBIT watches → 3 You decide. Horizontal stepper on desktop, stacked on mobile.

6. **Use-case cards (3)** — Real Estate / Watches / Car Parts, each with the workflow story from §2, linking to `/use-cases/*`.

7. **Stats band** (dark `--color-ink` background, white text): capability stats only — "30-min check frequency · 40+ supported sources · 7 opportunity categories". **Never fabricate customer counts, revenue results, or user totals.**

8. **Testimonial section** — 1 quote card + 2 smaller quotes. Mark with `<!-- demo content -->` in code and phrase as composable placeholder content clearly structured for real quotes later (do not invent identifiable people; use first name + role: "Markus, property investor").

9. **Final CTA** — centered: "Start finding opportunities today." + button + secondary "Talk to us" link.

**SEO:** `metadata` with title/description, OpenGraph image (`opengraph-image.tsx` using Next ImageResponse), JSON-LD `SoftwareApplication` schema.

## 18. Features Pages

- `/features` — index: 6 feature cards, each anchoring to a detail page.
- `/features/monitors` — "Monitors that never sleep" + screenshot + criteria/sensitivity/notifications details.
- `/features/discover` — natural-language discovery, filters, saved searches.
- `/features/deal-scores` — scoring, reference estimates, transparency/disclaimer section.
- `/features/collections` — collections, comparisons, pipeline statuses.
- `/features/alerts` — notification types, digest vs instant.
- `/features/market-insights` — category trends, price history.

Each detail page template: hero (title + sub + CTA), large visual, 3 benefit rows, "Works with" mini-list, FAQ (2–3 items), bottom CTA. Reuse a shared `FeaturePageLayout` component.

## 19. Use Cases (`/use-cases`)

Index + 3 pages: `real-estate`, `collectors`, `deal-hunting`. Template: hero with the persona story (§2), "A day with ORBIT" timeline, outcomes list, screenshot, CTA to `/signup?usecase=...`.

## 20. Pricing (`/pricing`)

- Monthly/Annual toggle (annual = 2 months free; prices update client-side).
- **3 tiers:**

| | Free | Pro €99/mo | Scale €249/mo |
|---|---|---|---|
| Monitors | 3 | 20 | 100 |
| Refresh | Daily | 30 min | 5 min |
| Collections | 2 | Unlimited | Unlimited |
| Price history | 30 days | 1 year | 2 years |
| Alerts | In-app | In-app + email | In-app + email + webhook |
| Comparison | 2 items | 4 items | 4 items |

- Cards: Pro highlighted (border `--color-brand`, "Most popular" pill).
- CTAs: "Start free" on Free; "Choose Pro/Scale" on paid → **honest modal: "Billing goes live at launch. Join the waitlist and we'll email you."** with a waitlist email field that inserts into `contact_messages` with kind=`billing_waitlist`.
- Feature comparison table (rows grouped: Discovery, Monitoring, Collaboration, Support).
- FAQ accordion (6 questions: trial, data sources, cancel, estimates disclaimer, teams, API).
- Disclaimer footer: "Prices in EUR, incl. VAT where applicable. Estimated values shown in the product are illustrative."

## 21. About / Contact / Blog / Legal

- **`/about`** — mission, principles (3), "How we think about data" (transparency + estimates disclaimer), team placeholders (roles, not fake bios), CTA.
- **`/contact`** — form: name, email, company, topic select (Sales / Support / Partnership / Press), message. Zod-validated Server Action → inserts `contact_messages` → success state + toast. Right column: response-time note, support email as `mailto:`, links to blog/docs.
- **`/blog`** — index with featured post + grid (category pills: Product, Research, Guides), `/blog/[slug]` from MDX in `content/blog/`, reading time, code blocks styled. Seed 3 posts (launch post, "How deal scoring works", "Monitoring Berlin real estate").
- **`/privacy`, `/terms`** — real, complete static content (generic but honest SaaS templates mentioning Supabase storage, no-sale-of-data, estimates-not-advice).

**Global SEO:** `sitemap.ts` (all marketing routes), `robots.ts`, canonical metadata on every page, `opengraph-image` on marketing routes, `not-found.tsx` (marketing-styled 404 with search + home CTA).

---

# Part V — Auth & Onboarding

## 22. Auth Pages (`app/(auth)/`)

- **`/signup`:** name, email, password (min 8), terms checkbox → Server Action `signUp` → email confirmation flow (if unconfirmed, show "Check your inbox" state). Google button conditional on env config.
- **`/login`:** email, password, "Forgot password" → `/forgot-password`. Error states for invalid credentials (never leak which field), rate-limit friendly messaging.
- **`/forgot-password` / `/reset-password`:** standard Supabase flows with success screens.
- **Layout:** split screen — left: form panel (max 400px, centered); right: brand panel with gradient mesh, product preview card, and one-line manifesto. On mobile the brand panel collapses to a logo + tagline header.
- All auth pages are Server Components + Server Actions; no client-side password handling beyond form.

## 23. Onboarding (after first signup)

`/app/onboarding` (3 short steps, skips if `profiles.onboarded_at` set):
1. **Pick interests** — category cards (Real Estate, Watches, Cars & Parts, Electronics, Home & Living).
2. **Create first monitor** — pre-filled natural-language example per chosen category (reuse the monitor form component).
3. **Done** — "Your first monitor is live" + "Go to dashboard".

Progress: `profiles.onboarding_step` updated per step. Unauthenticated `/app/*` → middleware redirect; new users → onboarding; `/app` redirects to `/app/overview`.

---

# Part VI — Application (`/app/*`)

Shared shell first, then pages. Every page is a Server Component fetching through `lib/data/*`, with client components only for interaction.

## 24. App Shell

**Sidebar (240/64px):**
- Logo block → `/app/overview`.
- **WORKSPACE:** Overview, Discover, Opportunities, Monitors, Collections, Comparisons.
- **INTELLIGENCE:** Market Insights, Price History, Video Reviews.
- **MANAGEMENT:** Notifications (unread count badge), Activity, Integrations.
- **Bottom:** usage meter card ("Monitors 12 / 20" progress bar → `/app/settings?tab=plan`), Settings, Help (→ `/contact`), avatar menu (Account, Preferences, Sign out).
- Active item: `--color-brand-subtle` bg + brand-tinted icon/label. `NavLink` everywhere.

**Topbar (56px):** breadcrumb; right: contextual actions (page-specific), notification bell (dropdown: latest 5 unread, mark-read on click, "Mark all read", "View all" → `/app/notifications`; closes on outside click/Escape), "New Monitor" primary button, avatar.

**Mobile:** hamburger → drawer; usage meter in drawer footer.

## 25. Overview Dashboard (`/app/overview`)

1. **Header:** "Your next opportunity is out there." + sub "Your internet intelligence, organized in one place." + New Monitor button.
2. **Discovery panel:** white card, 20px padding — title "What are you looking for?", 48px full-width search input, category chips (Real Estate, Cars & Parts, Watches, Electronics, Home & Living, Custom), primary "Discover Opportunities" → `/app/discover?q=...&category=...`, 3 example queries per category (click fills input). **It is a search form, not a chat.** No bubbles, no avatar.
3. **KPI row (4):** Active Monitors, Matching Opportunities, Price Drops Detected, Estimated Savings Found (tooltip: "Illustrative estimate based on sample data"). Each: icon in tinted circle, label, value, trend vs last week, 7-point sparkline (40px, no axes). Click → filtered destination page. Values computed from DB, not hardcoded.
4. **Fresh Opportunities table:** columns per §2.6 below with search-within, category filter, sort (Newest / Lowest price / Highest deal score / Biggest price drop), pagination (10/page — numbered pages, implemented fully). Row click → **detail drawer** (right, 480px; full-screen mobile) with full record, price-history chart, deal analysis, source link, and actions: Save to collection (dropdown), Start monitoring (opens monitor form prefilled), Mark as interesting, Close.
5. **Active Monitors widget:** name, category, match count, last checked (relative), status badge, notify icon, actions (pause/resume, edit, overflow → delete). Footer: Create Monitor + View all.
6. **Market Intelligence panel:** date range (7/30/90 days — actually changes queries): (a) discoveries over time area chart, (b) price drops by category horizontal bars, (c) average deal score big metric + trend line, (d) market vs listing price grouped bars. All `ResponsiveContainer`, currency-formatted axes (`€12k`), white bordered tooltips, computed from DB with date filtering.
7. **Recent Activity timeline:** icon + text with inline record links + relative time.

**≥1280px:** right context panel shows selected/latest opportunity summary + monitor status (mirrors the sample's right column).

## 26. Discover (`/app/discover`)

- Search bar reads `?q=&category=` on mount; recent queries chips; category chips.
- **Left filter rail 260px**, category-adaptive:
  - Real estate: city, neighborhood multi-select, price min/max, property type, bedrooms, gross yield min slider, price/m² max, budget max.
  - Products: brand multi-select, price range, condition, marketplace checkboxes, availability, "price drop only" toggle, rating min, delivery options.
  - Debounced 300ms apply; active filters as removable chips + "Clear all"; collapses to a sheet on mobile.
- **Results:** count + view toggle (grid/table) + sort + Save Search + Create Monitor.
  - Grid: 3/2/1 columns, card = 16:9 image (or placeholder), title, source, price, reference price, match badge, deal score bar, "View details".
  - Table: same columns as Overview table.
  - Empty state: "No opportunities match your search. Try broadening filters — or create a monitor to be notified when matching items appear."
- **Detail drawer:** 560px, gallery with thumbnails, price block (current/previous/estimate/change + score explanation), 30/90-day price chart, pros/cons (labeled illustrative), related alternatives, video review links, actions (Save to collection, Start monitoring, Mark interesting, Close).

## 27. Opportunities (`/app/opportunities`)

- Tabs with counts: All, New, Shortlisted, Under Review, Dismissed, Purchased/Completed.
- Table: checkbox, item, category, source, price, reference value, difference (abs + %), deal score, status, discovered, actions.
- **Bulk action bar** (floating bottom) when selected: Shortlist / Under review / Dismiss / Add to collection → Server Action, toast, activity log.
- **Detail drawer / `/app/opportunities/[id]`:** price vs reference, confidence badge (High/Medium/Low + drivers), data freshness, evidence links, real-estate yield block (asking price, est. rent, gross yield, expenses, net yield) with collapsible assumptions. Footer disclaimer: "AI-generated estimates are illustrative and do not guarantee investment returns."

## 28. Monitors (`/app/monitors`)

- Table: name, category, match count, last checked, frequency, status, notify pref, actions. Sort by name/matches/checked; search-within.
- **Create/Edit — 4-step modal (640px, full-screen mobile), progress header, state preserved between steps:**
  1. **Define:** description textarea (required, ≥10 chars), category, optional domain restriction. Helper: "Describe the opportunity in plain language — location, condition, attributes that matter."
  2. **Criteria:** price range, keyword tags, required attributes (category-dependent), excluded terms, sensitivity slider (Broad/Balanced/Strict, each with a one-line explanation).
  3. **Notifications:** in-app (default on), email (disabled + explanation), instant vs daily digest, price-drop-only toggle.
  4. **Review:** auto-generated editable name, read-only criteria summary, "Every 30 minutes — simulated until crawling is connected", **Activate Monitor**.
- Submit: insert via Server Action → toast "Monitor saved. Background crawling will activate when the backend is connected." → activity log → usage meter re-checks limit.
- Plan limit reached (Free=3): submit disabled with tooltip "Free plan allows 3 monitors. Upgrade to add more." → upgrade modal.
- Pause/resume inline; delete → confirm dialog with name → toast with **Undo** (5s restore from client-held copy).

## 29. Collections (`/app/collections`)

Left list of collections (seed: Dream Home Investments, Watch Wishlist, Rare Car Parts, Home Upgrade) with counts; grid/table of items; New Collection inline form; remove item with undo toast; empty state links to Discover.

## 30. Comparisons (`/app/comparisons`)

Search-and-select 2–4 opportunities (or from a collection). Comparison table: rows = price, market estimate, condition, key features, seller, source, availability, match score (+ area, bedrooms, rent, yields for real estate). Best value per row gets a subtle brand wash — no "WINNER" badges. Note: "Comparison based on sample data. Estimated values are illustrative." Max 4 enforced with helper text.

## 31. Notifications (`/app/notifications`)

Tabs: All, Price Drops, New Matches, Availability, Monitor Updates. Row: type icon, title, description, relative time, unread dot, link to record. Click → mark read + navigate; "Mark all as read"; unread count persists in DB and syncs with the bell badge.

## 32. Market Insights (`/app/market-insights`)

Category trend cards (avg price, 30-day change, volume), large area chart of avg price by category, distribution donut/bars by category, "Top movers" table (biggest drops). Range selector 30/90/180 days updates all queries.

## 33. Price History (`/app/price-history`)

Searchable tracked-items list with sparklines; selection → full-width annotated price-history chart + timeline table (date, event, price, source).

## 34. Video Reviews (`/app/video-reviews`)

Card grid: thumbnail (gradient + play icon fallback), title, source, duration, linked opportunity, external link. Category filter + search. Labeled "Curated sample content — external links are illustrative."

## 35. Activity (`/app/activity`)

Chronological feed of user actions + simulated monitoring events; text search + type filter; each row timestamped with record link.

## 36. Integrations (`/app/integrations`)

Cards: Amazon, eBay, Zillow, ImmobilienScout24, Chrono24, Kleinanzeigen, Bring a Trailer — status badge **"Not yet connected"** + "Request integration" modal (explains production backend required). Second section: Slack, Notion, Google Sheets, Zapier — same treatment. No card may imply a live connection.

## 37. Settings (`/app/settings`)

Tabs: **Profile** (name, email read-only, timezone → persists + toast), **Workspace** (default category, currency, items per page, theme: Light only with Dark "Coming later" disabled), **Notifications** (in-app, email disabled with explanation, weekly digest, price-drop alerts → persists), **Data** (export JSON of user data — build via a route handler streaming JSON; reset demo data → confirm dialog; clear collections), **Plan** (current plan card, usage meters, feature list, "Manage plan" → honesty modal, waitlist capture).

---

# Part VII — Billing & Usage (UI Only)

- `subscriptions` seeded: every new user → `free`.
- Usage meter components shared between sidebar and settings plan tab; computed with `count(monitors where user_id = X and status = 'active')`.
- Gates: monitor limit (Free 3), comparison limit (Free 2), collection limit (Free 2). Gate = disabled control + tooltip + "Upgrade" link opening the plan modal.
- Upgrade flow: modal listing Pro/Scale → "Join billing waitlist" (captures email) — **never a fake payment form.**

---

# Part VIII — Interaction, State, Responsive, Quality

## 38. The Universal Functionality Gate

Manually exercise before declaring done: sidebar navigation, search submission, category chips, example queries, KPI clicks, table sort/search/pagination, row → drawer, watch toggle, monitor CRUD + wizard validation + undo, notification read/unread/mark-all, collection create/add/remove, comparison select/remove, chart range filters, settings save, data export/reset, toasts on every mutation, empty/loading/error states, focus rings, aria labels on icon-only buttons, reload persistence of all user data.

## 39. State & Persistence

| State | Store | Notes |
|---|---|---|
| All entity data | Supabase | Server-rendered; RLS enforced |
| UI prefs (sidebar, view mode) | Zustand persist `orbit.ui` | Client only |
| Filters (Discover) | URL search params | Shareable, back/forward works |
| Toasts | Sonner | On every mutation |
| Recent queries | `searches` table | Top 10 |
| Optimistic UI | `useTransition` / `useOptimistic` | Status changes, read/unread, pause/resume |

## 40. Loading / Empty / Error

- **Loading:** route-level `loading.tsx` with skeleton cards/rows matching the target layout (not a centered spinner). Buttons spin during pending.
- **Empty:** contextual icon + one line + primary action (examples in Part VI).
- **Error:** `error.tsx` per route segment with retry; form errors inline and preserve input.

## 41. Responsive Matrix

| Breakpoint | Sidebar | Tables | Filters | Overlays |
|---|---|---|---|---|
| ≥1280 | Expanded/collapsed + right panel | Full columns | Left rail 260px | 640px modal, 480–560px drawer |
| 768–1279 | Collapsed icons | Horizontal scroll, sticky first col | Collapsible top panel | 90% modal, 70% drawer |
| <768 | Drawer | Scroll, key cols pinned | Bottom sheet | Full-screen |

Touch targets ≥44px. No horizontal page overflow at any breakpoint. Charts resize via `ResponsiveContainer`.

## 42. Accessibility & Performance Budgets

- Semantic landmarks (`header/nav/main/aside/footer`), one `h1` per page, logical heading order.
- All icon-only buttons have `aria-label`; modals/drawers trap focus and close on Escape; dropdowns use Radix semantics.
- Color contrast ≥ 4.5:1 for text; status never encoded by color alone (icon/text always).
- Images: `next/image` with real dimensions; LCP < 2.5s; marketing pages: no client JS beyond needed islands; keep client bundle lean (Recharts loaded only on routes that chart).
- Keyboard: full app usable via Tab/Enter/Escape.

---

# Part IX — Folder Structure

```
.
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx              # header + footer
│   │   ├── page.tsx                # landing
│   │   ├── features/[[...slug]]/   # index + detail pages
│   │   ├── use-cases/[[...slug]]/
│   │   ├── pricing/page.tsx
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── blog/page.tsx
│   │   ├── blog/[slug]/page.tsx
│   │   ├── privacy/page.tsx
│   │   └── terms/page.tsx
│   ├── (auth)/
│   │   ├── layout.tsx              # split-screen
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx              # AppShell (sidebar + topbar)
│   │   ├── onboarding/page.tsx
│   │   ├── overview/page.tsx
│   │   ├── discover/page.tsx
│   │   ├── opportunities/page.tsx
│   │   ├── opportunities/[id]/page.tsx
│   │   ├── monitors/page.tsx
│   │   ├── collections/page.tsx
│   │   ├── comparisons/page.tsx
│   │   ├── notifications/page.tsx
│   │   ├── market-insights/page.tsx
│   │   ├── price-history/page.tsx
│   │   ├── video-reviews/page.tsx
│   │   ├── activity/page.tsx
│   │   ├── integrations/page.tsx
│   │   └── settings/page.tsx
│   ├── api/
│   │   ├── auth/callback/route.ts  # Supabase OAuth callback
│   │   └── export/route.ts         # user data JSON export
│   ├── sitemap.ts
│   ├── robots.ts
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── layout.tsx
│   └── globals.css                 # ALL tokens here
├── components/
│   ├── ui/                         # shadcn-based primitives
│   │   ├── button.tsx input.tsx select.tsx badge.tsx
│   │   ├── card.tsx dialog.tsx drawer.tsx dropdown.tsx
│   │   ├── table.tsx tabs.tsx tooltip.tsx toast.tsx
│   │   ├── skeleton.tsx empty-state.tsx avatar.tsx switch.tsx
│   ├── marketing/
│   │   ├── site-header.tsx site-footer.tsx
│   │   ├── hero.tsx product-preview.tsx logo-bar.tsx
│   │   ├── feature-rows.tsx how-it-works.tsx use-case-cards.tsx
│   │   ├── pricing-table.tsx faq-accordion.tsx cta-band.tsx
│   │   └── sections/                # reusable section blocks
│   ├── app/
│   │   ├── shell/sidebar.tsx topbar.tsx usage-meter.tsx
│   │   ├── overview/discovery-panel.tsx kpi-card.tsx
│   │   │   opportunity-table.tsx active-monitors.tsx
│   │   │   market-charts.tsx activity-feed.tsx context-panel.tsx
│   │   ├── discover/search-bar.tsx filter-panel.tsx
│   │   │   result-card.tsx results-table.tsx
│   │   ├── opportunities/opportunity-drawer.tsx deal-analysis.tsx
│   │   ├── monitors/monitor-form.tsx monitor-table.tsx
│   │   ├── comparisons/comparison-table.tsx
│   │   └── notifications/notification-bell.tsx notification-list.tsx
│   └── shared/                      # charts, data-display, feedback
│       ├── charts/ (line, area, bar, donut, sparkline, score-bar)
│       ├── data-table.tsx relative-time.tsx money.tsx
├── content/blog/*.mdx
├── lib/
│   ├── supabase/ (client.ts, server.ts, middleware.ts, admin.ts)
│   ├── data/                        # §8 contract — every DB access lives here
│   ├── actions/                     # Server Actions (auth, monitors, …) with Zod
│   ├── validations/                 # shared Zod schemas
│   ├── hooks/ (use-debounce, use-media-query, use-filters)
│   ├── stores/ (ui-store.ts)
│   └── utils/ (currency, date, score, cn)
├── supabase/
│   ├── migrations/ (0001_schema.sql, 0002_enums.sql, 0003_seed.sql, …)
│   └── config.toml
├── tests/ (components/, e2e/)
├── middleware.ts
├── next.config.ts
├── tailwind.config.ts               # v4 if CSS-first: may be absent
├── tsconfig.json                    # strict: true
└── .env.local.example               # NEXT_PUBLIC_SUPABASE_URL, keys
```

---

# Part X — Implementation Sequence (Cursor Phases)

Run `npx tsc --noEmit && npm run lint && npm run build` after **every** phase. Each phase is a commit-sized unit.

### Phase 0 — Repo & Tooling (½ day)
Scaffold Next.js 15 + TS strict + Tailwind 4 + ESLint/Prettier; install shadcn/ui, TanStack Query, Zustand, RHF+Zod, Recharts, Sonner, Lucide, Supabase SSR; add `.env.local.example`; create token CSS (§11–13) in `globals.css`.
**Done when:** `npm run dev` serves a blank page using tokens; build passes.

### Phase 1 — Design System Components (1–1.5 day)
Build `components/ui/*` (states per §15) + shared `charts/*` + `Money`, `RelativeTime`, `ScoreBar`, `DataTable` wrapper. Dev-only `/dev/ui` route rendering every component in every state.
**Done when:** `/dev/ui` shows all components; focus rings and disabled/loading states verified.

### Phase 2 — Supabase & Schema (1 day)
Create project/migrations (§7): enums, tables, RLS, trigger for profile creation, seed migration (§ below). `lib/supabase/{client,server,admin}.ts` + middleware.
**Seed data:** 48 opportunities across 6 categories (≥10 real-estate with `real_estate` jsonb incl. yield fields, plus the 5 canonical rows from v2), 100+ price_history rows, 6 monitors, 15 notifications, 20 activity events, 4 collections, 8 video reviews, 3 plans, subscription = pro for demo user.
**Done when:** migration applies cleanly; a test Server Component reads a seeded row; RLS blocks cross-user reads.

### Phase 3 — Auth (1 day)
Signup/login/forgot/reset pages (§22), Server Actions, middleware protection, sign-out.
**Done when:** full signup → login → protected `/app/overview` shell render → sign-out works; unauthenticated redirect works.

### Phase 4 — Marketing Shell + Landing (2 days)
Header/footer (§16), landing sections (§17) with `ProductPreview` built from real card components, SEO metadata + OG image + JSON-LD.
**Done when:** landing renders at 375/768/1440 with zero overflow; all CTAs navigate; header mobile sheet works.

### Phase 5 — Marketing Sub-pages (2 days)
Features index + 6 detail pages, use cases (index + 3), pricing (§20), about, contact (working insert), privacy/terms, 404, sitemap/robots.
**Done when:** every nav link resolves; contact form inserts and shows success; pricing toggle updates numbers; upgrade modal honesty flow works.

### Phase 6 — Blog (½ day)
MDX pipeline, index + slug pages, 3 seed posts.
**Done when:** posts render with styled typography; listed on sitemap.

### Phase 7 — App Shell + Onboarding (1 day)
Sidebar (groups, collapse persistence, usage meter), topbar (bell dropdown, New Monitor), mobile drawer, breadcrumbs, `/app/onboarding`.
**Done when:** navigation works at all breakpoints; bell marks read; collapse persists across reload.

### Phase 8 — Data Actions & Overview (2 days)
All `lib/data/*` + Server Actions with Zod; Overview page §25 end-to-end (KPIs computed, table with sort/search/pagination, drawer, monitors widget, charts with ranges, activity feed, context panel).
**Done when:** every Overview interaction works; charts change with range; drawer actions mutate DB and reflect after `router.refresh()`.

### Phase 9 — Discover (1.5 days)
Search + filters in URL params, grid/table views, detail drawer with chart/gallery/actions, empty states, Save Search.
**Done when:** query from Overview populates; filters actually filter the DB results; empty state appears for impossible query.

### Phase 10 — Monitors (1.5 days)
Table + 4-step wizard (validation, step persistence, review), create/edit/pause/delete with undo, plan gating, toast/activity on save.
**Done when:** full CRUD persists; limit gate blocks Free users with tooltip; wizard validates each step.

### Phase 11 — Opportunities, Collections, Comparisons (1.5 days)
Tabs + bulk actions + deal drawer with disclaimer; collections CRUD; comparison table with 2–4 limit.
**Done when:** bulk update affects all selected rows and toasts; comparison best-value wash works.

### Phase 12 — Remaining App Pages (1.5 days)
Notifications, Activity, Market Insights, Price History, Video Reviews, Integrations, Settings (all tabs incl. export/reset/plan).
**Done when:** each page is populated from seed/DB — no placeholder text remains anywhere.

### Phase 13 — Polish, SEO, A11y, Perf (1–1.5 days)
- Fix all `tsc`/lint/build errors; zero React console warnings.
- Pass §38 checklist item by item.
- Lighthouse: marketing ≥95 SEO/Best Practices, ≥90 Performance; contrast audit; keyboard walkthrough; focus-trap test.
- Responsive sweep at 375 / 768 / 1280 / 1440 on every route.
- Verify all honesty labels present (sample badges, estimates disclaimers, not-connected integrations, billing modal).
**Done when:** §49 acceptance criteria all true.

---

# Part XI — Acceptance Criteria

1. `npm run build` succeeds with **zero** TypeScript and lint errors; dev server has a clean console through a full navigation + interaction pass.
2. **All marketing routes** (17+) render real content — header/footer/nav links all resolve; 404 works.
3. **All app routes** (onboarding + 13 pages) render DB-backed content — no placeholder or TODO text.
4. Auth: signup, login, logout, protected routes, and redirect-back-after-login all work.
5. User data persists across reload: monitors, collections, comparison state, notification reads, statuses, settings, sidebar collapse.
6. Every element in §38 has been manually exercised and works.
7. No horizontal overflow at 375 / 768 / 1440 on **any** route.
8. Design fidelity: tokens used (no hardcoded hex in components), type scale respected, tabular nums on all numerics, chart palette order followed.
9. Honesty gates: sample badges visible, estimates labeled, integrations "Not yet connected", billing waitlist — no false claims of live crawling/verified savings/real payments.
10. A11y: keyboard-only pass on app + landing, aria labels present, focus trapped in overlays, contrast ≥4.5:1.
11. SEO: sitemap complete, metadata on every marketing route, OG image renders, JSON-LD valid.

---

**End of specification.** Follow Part X phases in order; verify each against its "Done when" before proceeding; finish against Part XI.
