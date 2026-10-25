/* Generates supabase/migrations/0002_seed.sql from the TypeScript seed module
   (lib/db/seed.ts) so the production database and the local demo share one
   source of truth. Run: npx tsx scripts/generate-supabase-seed.ts */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { SEED_OPPORTUNITIES } from '../lib/db/seed';

const q = (v: string | null | undefined): string => (v == null ? 'null' : `'${v.replace(/'/g, "''")}'`);
const n = (v: number | null | undefined): string => (v == null ? 'null' : String(v));
const j = (v: unknown): string => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;

const lines: string[] = [
  '-- ============================================================================',
  '-- ORBIT Intelligence — global seed (generated from lib/db/seed.ts).',
  '-- Plans, global sample opportunities (user_id IS NULL) and video reviews.',
  '-- Per-user content (monitors, notifications, …) is created on first login',
  '-- by the app so every account starts with a populated workspace.',
  '-- ============================================================================',
  '',
  'insert into plans (code, name, monitor_limit, collection_limit, comparison_limit, price_monthly_eur, refresh_label, features) values',
  "  ('free', 'Free', 3, 2, 2, 0, 'Daily refresh', '[\"3 monitors\",\"Daily refresh\",\"2 collections\",\"30-day price history\",\"In-app alerts\",\"Compare 2 items\"]'::jsonb),",
  "  ('pro', 'Pro', 20, -1, 4, 99, '30-minute refresh', '[\"20 monitors\",\"30-minute refresh\",\"Unlimited collections\",\"1-year price history\",\"In-app + email alerts\",\"Compare 4 items\",\"Market insights\"]'::jsonb),",
  "  ('scale', 'Scale', 100, -1, 4, 249, '5-minute refresh', '[\"100 monitors\",\"5-minute refresh\",\"Unlimited collections\",\"2-year price history\",\"In-app + email + webhook alerts\",\"Compare 4 items\",\"Priority support\",\"API access (coming soon)\"]'::jsonb)",
  'on conflict (code) do nothing;',
  '',
  'insert into opportunities (id, user_id, title, description, category, source_marketplace, source_url, current_price, previous_price, estimated_market_value, price_change_pct, deal_score, match_score, status, discovered_at, last_checked_at, is_sample, attributes, real_estate, evidence_links) values',
];

const oppRows = SEED_OPPORTUNITIES.map((o) => {
  const change =
    o.previous_price != null
      ? Number((((o.current_price - o.previous_price) / o.previous_price) * 100).toFixed(1))
      : null;
  return `  (${q(o.id)}, null, ${q(o.title)}, ${q(o.description)}, ${q(o.category)}, ${q(o.source_marketplace)}, ${q(o.source_url)}, ${o.current_price}, ${n(o.previous_price ?? null)}, ${n(o.estimated_market_value)}, ${n(change)}, ${o.deal_score}, ${o.match_score}, ${q(o.status ?? 'new')}, now(), now(), true, ${j(o.attributes)}, ${o.real_estate ? j(o.real_estate) : 'null'}, array[${o.evidence.map((e) => q(`https://duckduckgo.com/?q=${encodeURIComponent(`${e} ${o.title}`)}`)).join(', ')}]::text[])`;
});
lines.push(oppRows.join(',\n') + '\non conflict (id) do nothing;', '');

const videos = [
  ['vid-001', 'Buying in Friedrichshain: a walkthrough of three listings', 'YouTube', 'https://www.youtube.com/results?search_query=berlin+friedrichshain+apartment+tour', '14:22', 'opp-001', 'real_estate'],
  ['vid-002', 'Omega Seamaster 300M — one year on the wrist', 'YouTube', 'https://www.youtube.com/results?search_query=omega+seamaster+300m+review', '18:05', 'opp-002', 'watches'],
  ['vid-003', 'Porsche 997 buyer’s guide: what to check', 'YouTube', 'https://www.youtube.com/results?search_query=porsche+997+buyer+guide', '26:41', 'opp-003', 'cars_parts'],
  ['vid-004', 'Eames lounge: real vs replica — how to tell', 'YouTube', 'https://www.youtube.com/results?search_query=eames+lounge+chair+original+vs+replica', '11:37', 'opp-005', 'home_living'],
  ['vid-005', 'Heuer Carrera 2447 — auction story', 'YouTube', 'https://www.youtube.com/results?search_query=heuer+carrera+2447', '9:58', 'opp-006', 'watches'],
  ['vid-006', 'ThinkPad X1 Carbon G9 long-term review', 'YouTube', 'https://www.youtube.com/results?search_query=thinkpad+x1+carbon+gen+9+review', '21:12', 'opp-007', 'electronics'],
  ['vid-007', 'Berlin rental yields explained — numbers on screen', 'YouTube', 'https://www.youtube.com/results?search_query=berlin+rental+yield+explained', '16:48', null, 'real_estate'],
  ['vid-008', 'Watch box tour: divers under €5,000', 'YouTube', 'https://www.youtube.com/results?search_query=best+diver+watches+under+5000', '13:30', null, 'watches'],
] as const;

lines.push(
  'insert into video_reviews (id, user_id, title, source, source_url, duration, opportunity_id, category, is_sample) values'
);
lines.push(
  videos
    .map((v) => `  (${q(v[0])}, null, ${q(v[1])}, ${q(v[2])}, ${q(v[3])}, ${q(v[4])}, ${v[5] ? q(v[5]) : 'null'}, ${q(v[6])}, true)`)
    .join(',\n') + '\non conflict (id) do nothing;',
  ''
);

const out = join(process.cwd(), 'supabase', 'migrations', '0002_seed.sql');
writeFileSync(out, lines.join('\n'), 'utf8');
console.log(`wrote ${out} (${SEED_OPPORTUNITIES.length} opportunities, ${videos.length} videos)`);
