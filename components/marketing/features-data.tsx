/* Content for the six feature detail pages (plan §18). */
import type { FeaturePageData } from './feature-page';

const sharedVisualNote = 'Sample data — reference values are illustrative estimates';

export const FEATURES: FeaturePageData[] = [
  {
    slug: 'monitors',
    title: 'Monitors',
    heading: 'Monitors that never sleep',
    sub: 'Describe the opportunity once. ORBIT keeps checking your sources on schedule, scores every match, and tells you the moment something appears.',
    benefits: [
      {
        title: 'Plain-language criteria',
        body: 'Location, condition, price band, part number — write it like you’d tell a colleague. Structured criteria follow from your description.',
      },
      {
        title: 'Sensitivity you control',
        body: 'Broad catches loose matches for rare items. Strict only surfaces the ones that fit every criterion. Balanced sits between.',
      },
      {
        title: 'Alerts that respect your attention',
        body: 'Instant in-app alerts or a daily digest. Price-drop-only mode stays quiet until something gets cheaper.',
      },
    ],
    worksWith: ['ImmobilienScout24 (coming soon)', 'Chrono24 (coming soon)', 'eBay (coming soon)', 'Kleinanzeigen (coming soon)', 'Bring a Trailer (coming soon)'],
    faq: [
      {
        q: 'How often do monitors check sources?',
        a: 'Free checks daily, Pro every 30 minutes, Scale every 5 minutes. In this build, check runs are simulated until the production crawler is connected — your monitors, criteria and alerts are fully live.',
      },
      {
        q: 'Can I pause a monitor?',
        a: 'Yes — pause and resume inline from the monitors table or the overview widget. Pausing frees your plan’s monitor slot.',
      },
    ],
    visual: (
      <div className="rounded-xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <div className="space-y-3">
          {[
            ['Berlin apartments under €350k', '5.5%+ yield', '30 min', '24 matches'],
            ['Omega Seamaster below €4,000', 'box & papers', '30 min', '11 matches'],
            ['Porsche 911 (997) OEM parts', 'NOS preferred', '5 min', '8 matches'],
          ].map(([name, detail, freq, matches]) => (
            <div key={name} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[var(--color-line)] p-3.5">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">{name}</p>
                <p className="text-[12px] text-[var(--color-ink-tertiary)]">{detail}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-[#12B76A1A] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-positive)]">Active</span>
                <span className="tnum text-[12px] text-[var(--color-ink-tertiary)]">{freq}</span>
                <span className="tnum text-[13px] font-semibold">{matches}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[11px] text-[var(--color-ink-tertiary)]">{sharedVisualNote}</p>
      </div>
    ),
  },
  {
    slug: 'discover',
    title: 'Discovery',
    heading: 'Find it like you describe it',
    sub: 'Natural-language search, category-aware filters and saved queries — over a database of structured, scored records instead of links you lose.',
    benefits: [
      {
        title: 'Search that speaks your language',
        body: '“2-room apartment Berlin under €350k with 5%+ yield” returns exactly that — filters and facets are derived from the results, not the other way round.',
      },
      {
        title: 'Filters that actually filter',
        body: 'Neighborhood, yield, price per m², brand, condition, marketplace, price-drop-only — every filter re-queries the database live.',
      },
      {
        title: 'Saved searches and shareable URLs',
        body: 'Every search lives in the URL. Save the ones you run often and re-run them from your overview in one click.',
      },
    ],
    worksWith: ['Saved searches', 'Grid & table views', 'URL-shareable filters', 'Recent queries'],
    faq: [
      {
        q: 'Where does the data come from?',
        a: 'This build runs on curated sample data so you can evaluate the full workflow. The production crawler connects live marketplace sources — the app’s data layer is built for that swap.',
      },
      {
        q: 'Can I turn a search into a monitor?',
        a: 'Yes — the Create Monitor button prefills your current query and category, so watching happens without retyping anything.',
      },
    ],
    visual: (
      <div className="rounded-xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <div className="flex h-11 items-center gap-2 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-subtle)] px-3.5">
          <span className="text-[14px] text-[var(--color-ink-tertiary)]">apartment friedrichshain, yield above 5.5%…</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {['Real Estate', 'Friedrichshain', 'Under €350k', 'Yield 5%+'].map((c, i) => (
            <span key={c} className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${i === 0 ? 'bg-[var(--color-ink)] text-white' : 'border border-[var(--color-line)] text-[var(--color-ink-secondary)]'}`}>
              {c}
            </span>
          ))}
        </div>
        <p className="mt-4 text-[12px] text-[var(--color-ink-tertiary)]">13 results · sorted by deal score</p>
        <div className="mt-2 space-y-2">
          {[
            ['2-Zimmer-Wohnung, Friedrichshain', '€329,000', '88'],
            ['Condo Prenzlauer Berg, 5.6% yield', '€348,000', '76'],
          ].map(([t, p, s]) => (
            <div key={t} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-line)] px-3.5 py-3">
              <span className="truncate text-[13px] font-medium">{t}</span>
              <span className="tnum text-[13px] font-semibold">{p}</span>
              <span className="tnum rounded-full bg-[#12B76A1A] px-2 py-0.5 text-[11px] font-semibold text-[var(--color-positive)]">{s}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    slug: 'deal-scores',
    title: 'Deal Scores',
    heading: 'Every match, priced against reference',
    sub: 'A deal score summarizes how far below the estimated reference value a listing sits — with the evidence linked and the assumptions exposed.',
    benefits: [
      {
        title: 'One number, fully traceable',
        body: 'The score weighs the gap to reference, observed price movement and match quality. Drill into any record to see every input.',
      },
      {
        title: 'Reference bands, not guesses',
        body: 'Estimated market values are computed from comparable observations and always labeled as illustrative — never presented as appraisals.',
      },
      {
        title: 'Built for real estate',
        body: 'Property matches arrive with gross and net yields, price per m² and rent estimates — with the assumptions one click away.',
      },
    ],
    worksWith: ['Reference bands', 'Price history', 'Yield analysis', 'Evidence links'],
    faq: [
      {
        q: 'Are the estimates reliable?',
        a: 'They are illustrative estimates computed from tracked observations and public reference data — clearly labeled as such. They are not appraisals and never guarantee returns. Always verify on the source listing.',
      },
      {
        q: 'How is the score calculated?',
        a: 'Score weighs the gap between asking price and estimated reference value, recent price movement, and how well the listing matches your monitor criteria. Every component is visible on the opportunity page.',
      },
    ],
    visual: (
      <div className="rounded-xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <p className="text-[14px] font-semibold">2-Zimmer-Wohnung, Friedrichshain</p>
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {[
            ['Asking', '€329k', 'var(--color-ink)'],
            ['Reference', '€356k', 'var(--color-info)'],
            ['Below band', '7.6%', 'var(--color-positive)'],
          ].map(([k, v, c]) => (
            <div key={k} className="rounded-lg border border-[var(--color-line)] p-3">
              <p className="text-[11px] text-[var(--color-ink-tertiary)]">{k}</p>
              <p className="tnum text-lg font-semibold" style={{ color: c }}>{v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg border border-[var(--color-line)] p-3.5">
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-ink-tertiary)]">Gross yield (est.)</span>
            <span className="tnum font-semibold">4.3%</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[12px]">
            <span className="text-[var(--color-ink-tertiary)]">Est. rent / mo</span>
            <span className="tnum font-semibold">€1,180</span>
          </div>
          <p className="mt-2 text-[10px] text-[var(--color-ink-tertiary)]">Illustrative estimate — assumptions expandable</p>
        </div>
        <p className="mt-3 text-center text-[11px] text-[var(--color-ink-tertiary)]">{sharedVisualNote}</p>
      </div>
    ),
  },
  {
    slug: 'collections',
    title: 'Collections',
    heading: 'Your shortlist, organized',
    sub: 'Collections group the opportunities you care about. Move records through your pipeline — new, shortlisted, under review, purchased — without spreadsheets.',
    benefits: [
      {
        title: 'Group by mission',
        body: 'A watch wishlist, a renovation-parts list, this quarter’s property targets — each collection is one click from the overview.',
      },
      {
        title: 'A pipeline, not a pile',
        body: 'Status tabs and bulk actions keep the funnel moving. Mark three items under review in one keystroke.',
      },
      {
        title: 'Undo by default',
        body: 'Removing an item or deleting a collection is reversible from the toast — for five seconds, which is usually enough.',
      },
    ],
    worksWith: ['Unlimited collections on Pro', 'Bulk actions', 'Compare from collection', 'Undo toasts'],
    faq: [
      {
        q: 'How many collections do I get?',
        a: 'Two on the Free plan, unlimited on Pro and Scale. The plan tab in settings shows your usage at any time.',
      },
    ],
    visual: (
      <div className="rounded-xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Dream Home', 4, 'var(--color-brand)'],
            ['Watch Wishlist', 3, 'var(--color-info)'],
            ['Rare Car Parts', 2, 'var(--color-positive)'],
            ['Home Upgrade', 1, 'var(--color-violet)'],
          ].map(([name, count, color]) => (
            <div key={name as string} className="rounded-lg border border-[var(--color-line)] p-3.5">
              <span className="block size-2.5 rounded-full" style={{ background: color as string }} />
              <p className="mt-2 truncate text-[13px] font-medium">{name}</p>
              <p className="tnum text-[11px] text-[var(--color-ink-tertiary)]">{count} items</p>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    slug: 'alerts',
    title: 'Alerts',
    heading: 'Know the moment it appears',
    sub: 'In-app notifications for new matches, price drops and availability changes — instant or as a daily digest. The good ones sell in hours.',
    benefits: [
      {
        title: 'Four signal types',
        body: 'New matches, price drops, availability changes and monitor updates — each with a direct link to the record.',
      },
      {
        title: 'Instant or digest',
        body: 'Per-monitor choice: the moment it happens, or one summary a day. Price-drop-only mode for the patient hunter.',
      },
      {
        title: 'Read state that syncs',
        body: 'Unread counts persist across devices — the bell in the top bar and the notifications page always agree.',
      },
    ],
    worksWith: ['In-app alerts', 'Daily digest', 'Price-drop-only mode', 'Email (coming soon)'],
    faq: [
      {
        q: 'Do you send email alerts?',
        a: 'Email delivery goes live at launch — the toggle exists and is clearly labeled. In-app alerts are fully functional today.',
      },
      {
        q: 'Can I mute a monitor?',
        a: 'Pause the monitor or switch it to digest mode. You keep the matches; the pings stop.',
      },
    ],
    visual: (
      <div className="rounded-xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <ul className="space-y-2.5">
          {[
            ['Price drop', 'Omega Seamaster — below reference band', '12 min'],
            ['New match', '2 listings match “Berlin apartments”', '2 h'],
            ['Availability', '997 headlight back in stock', '5 h'],
          ].map(([type, body, when]) => (
            <li key={body} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface-subtle)] p-3.5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="size-2 shrink-0 rounded-full bg-[var(--color-brand)]" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-[var(--color-brand)]">{type}</p>
                  <p className="truncate text-[13px] font-medium">{body}</p>
                </div>
              </div>
              <span className="shrink-0 text-[11px] text-[var(--color-ink-tertiary)]">{when} ago</span>
            </li>
          ))}
        </ul>
      </div>
    ),
  },
  {
    slug: 'market-insights',
    title: 'Market Insights',
    heading: 'The market, in your categories',
    sub: 'Average prices, drop rates and tracked volume per category — plus the biggest movers across everything you watch.',
    benefits: [
      {
        title: 'Trends per category',
        body: 'See the average price and how many tracked listings dropped in the window you choose: 30, 90 or 180 days.',
      },
      {
        title: 'Top movers, ranked',
        body: 'The largest observed price cuts across your tracked items, with direct links to the records.',
      },
      {
        title: 'Price history per item',
        body: 'Every observation ORBIT recorded, charted with the reference band — so you know if “cheap” is actually cheap.',
      },
    ],
    worksWith: ['Category trends', 'Top movers', 'Price history charts', 'Range selectors'],
    faq: [
      {
        q: 'Which data powers insights?',
        a: 'Everything in your workspace: tracked opportunities and their recorded observations. Sample data in this build; live sources at launch.',
      },
    ],
    visual: (
      <div className="rounded-xl border border-[var(--color-line)] bg-white p-6 shadow-[var(--shadow-lg)]">
        <div className="flex justify-end gap-1">
          {['30d', '90d', '180d'].map((r, i) => (
            <span key={r} className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${i === 1 ? 'bg-[var(--color-ink)] text-white' : 'text-[var(--color-ink-tertiary)]'}`}>{r}</span>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[['Real Estate', '€298k', 'var(--color-brand)'], ['Watches', '€3.4k', 'var(--color-info)'], ['Cars & Parts', '€1.1k', 'var(--color-positive)']].map(([label, value, color]) => (
            <div key={label} className="rounded-lg border border-[var(--color-line)] p-3">
              <p className="truncate text-[11px] text-[var(--color-ink-tertiary)]">{label}</p>
              <p className="tnum text-lg font-semibold">{value}</p>
              <svg viewBox="0 0 64 16" className="mt-1 h-3 w-full" aria-hidden>
                <path d="M1,12 C12,8 20,13 32,9 C44,5 52,10 63,4" fill="none" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-[var(--color-ink-tertiary)]">{sharedVisualNote}</p>
      </div>
    ),
  },
];

export const FEATURE_INDEX: Array<{ slug: string; title: string; description: string; icon: string }> = FEATURES.map((f) => ({
  slug: f.slug,
  title: f.title,
  description: f.sub,
  icon: f.slug,
}));
