/* ============================================================================
   Deterministic demo seed. Global rows (opportunities, video reviews, plans)
   are inserted once; per-user rows (monitors, notifications, activity,
   collections, subscription) are inserted on signup so every page has
   content on first login (plan Phase 2).
   All seeded rows keep is_sample = 1 and render the sample-data badge.
   ========================================================================== */

import type { Db } from './index';
import { hashPassword } from '../auth/password';
import type {
  ActivityKind,
  Category,
  MonitorSensitivity,
  NotificationType,
  OpportunityStatus,
  PlanCode,
  RealEstateAttributes,
} from '@/lib/types';

/* Deterministic PRNG so seeds are stable. */
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20261025);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
const between = (min: number, max: number) => min + rand() * (max - min);
const daysAgo = (d: number, hourOffset = 0): string => {
  const t = new Date(Date.now() - d * 86_400_000 - hourOffset * 3_600_000);
  return t.toISOString();
};

interface SeedOpp {
  id: string;
  title: string;
  description: string;
  category: Category;
  source_marketplace: string;
  source_url: string;
  current_price: number;
  previous_price?: number;
  estimated_market_value: number;
  deal_score: number;
  match_score: number;
  status?: OpportunityStatus;
  discoveredDaysAgo: number;
  checkedHoursAgo: number;
  attributes: Record<string, string | number | boolean>;
  real_estate?: RealEstateAttributes;
  evidence: string[];
}

const op = (s: SeedOpp): SeedOpp => s;

/* ------------------------------ Canonical rows ------------------------------ */

const CANONICAL: SeedOpp[] = [
  op({
    id: 'opp-001',
    title: '2-Zimmer-Wohnung, Friedrichshain — below market, tenant-free',
    description:
      'Renovated 2-room apartment near Boxhagener Platz. Seller motivated, listed 6% under the last comparable sale in the building. Quiet courtyard position, cellar included.',
    category: 'real_estate',
    source_marketplace: 'ImmobilienScout24',
    source_url: 'https://www.immobilienscout24.de/expose/143672091',
    current_price: 329000,
    previous_price: 342000,
    estimated_market_value: 356000,
    deal_score: 88,
    match_score: 94,
    status: 'shortlisted',
    discoveredDaysAgo: 1,
    checkedHoursAgo: 2,
    attributes: { exposure: 'courtyard', condition: 'renovated', energy_class: 'C', elevator: false },
    real_estate: {
      city: 'Berlin',
      neighborhood: 'Friedrichshain',
      property_type: 'Apartment',
      bedrooms: 2,
      area_m2: 58,
      year_built: 1908,
      est_rent_monthly: 1180,
      gross_yield_pct: 4.3,
      expenses_monthly: 210,
      net_yield_pct: 3.3,
    },
    evidence: [
      'immobilienscout24.de/expose/143672091',
      'stadtentwicklung.berlin.de/bodenrichtwerte Friedrichshain 2026',
      'gesobau.de comparable sales Q3',
    ],
  }),
  op({
    id: 'opp-002',
    title: 'Omega Seamaster Diver 300M — box & papers, below €4,000',
    description:
      '2018 Seamaster Diver 300M, full set with box and papers, service recently done. Selling below the Chrono24 reference band for excellent condition.',
    category: 'watches',
    source_marketplace: 'Chrono24',
    source_url: 'https://www.chrono24.de/omega/seamaster-diver-300m-id28841.htm',
    current_price: 3850,
    previous_price: 4150,
    estimated_market_value: 4300,
    deal_score: 82,
    match_score: 91,
    status: 'new',
    discoveredDaysAgo: 0,
    checkedHoursAgo: 1,
    attributes: { brand: 'Omega', reference: '210.30.42.20.03.001', year: 2018, condition: 'Excellent', box_papers: true, movement: 'Automatic' },
    evidence: ['chrono24.de price band 210.30.42.20.03.001', 'omegaforums.net recent sales thread'],
  }),
  op({
    id: 'opp-003',
    title: 'Porsche 911 (997) OEM headlight, new old stock',
    description:
      'Genuine OEM 997.2 bi-xenon headlight, new old stock, part number 997.631.476.03. These appear on forums and sell within hours.',
    category: 'cars_parts',
    source_marketplace: 'Kleinanzeigen',
    source_url: 'https://www.kleinanzeigen.de/s-anzeige/porsche-997-scheinwerfer-oem/264117829',
    current_price: 890,
    previous_price: 1150,
    estimated_market_value: 1200,
    deal_score: 91,
    match_score: 96,
    status: 'new',
    discoveredDaysAgo: 0,
    checkedHoursAgo: 3,
    attributes: { make: 'Porsche', model: '911 (997.2)', part_number: '997.631.476.03', condition: 'New old stock', side: 'Left' },
    evidence: ['rennlist.com parts price survey', 'porsche.com classic parts catalog'],
  }),
  op({
    id: 'opp-004',
    title: '3-room condo Prenzlauer Berg — estimated gross yield 5.6%',
    description:
      'Rented 3-room condo with a long-standing tenant at market rent. Gross yield above the neighborhood average; maintenance reserve already funded.',
    category: 'real_estate',
    source_marketplace: 'ImmobilienScout24',
    source_url: 'https://www.immobilienscout24.de/expose/141998344',
    current_price: 348000,
    estimated_market_value: 362000,
    deal_score: 76,
    match_score: 88,
    discoveredDaysAgo: 3,
    checkedHoursAgo: 5,
    attributes: { exposure: 'street', condition: 'well-kept', energy_class: 'D', balcony: true },
    real_estate: {
      city: 'Berlin',
      neighborhood: 'Prenzlauer Berg',
      property_type: 'Condo',
      bedrooms: 3,
      area_m2: 74,
      year_built: 1934,
      est_rent_monthly: 1620,
      gross_yield_pct: 5.6,
      expenses_monthly: 260,
      net_yield_pct: 4.4,
    },
    evidence: ['immobilienscout24.de/expose/141998344', 'emiya rent index Prenzlauer Berg'],
  }),
  op({
    id: 'opp-005',
    title: 'Vintage Eames Lounge Chair & Ottoman, 1970s — dealer drop',
    description:
      'Original Vitra-manufactured lounge chair with ottoman, rosewood veneer, seller reduced price twice in 30 days.',
    category: 'home_living',
    source_marketplace: 'eBay',
    source_url: 'https://www.ebay.de/itm/295611839201',
    current_price: 3450,
    previous_price: 3990,
    estimated_market_value: 4200,
    deal_score: 84,
    match_score: 87,
    status: 'under_review',
    discoveredDaysAgo: 2,
    checkedHoursAgo: 8,
    attributes: { brand: 'Vitra', designer: 'Charles & Ray Eames', material: 'Rosewood', era: '1970s', condition: 'Very good' },
    evidence: ['ebay.de sold listings lounge chair', '1stdibs reference listing'],
  }),
  op({
    id: 'opp-006',
    title: 'Heuer Carrera 2447 — collector direct sale',
    description:
      'First-execution Carrera from 1965, unpolished case, matching numbers. Private sale, priced under recent auction hammer range.',
    category: 'watches',
    source_marketplace: 'Watchuseek',
    source_url: 'https://forums.watchuseek.com/f29/heuer-carrera-2447-sale',
    current_price: 7200,
    previous_price: 7900,
    estimated_market_value: 8400,
    deal_score: 79,
    match_score: 85,
    discoveredDaysAgo: 4,
    checkedHoursAgo: 12,
    attributes: { brand: 'Heuer', reference: '2447', year: 1965, condition: 'Very good', box_papers: false, movement: 'Manual' },
    evidence: ['phillips.com auction results Carrera 2447', 'onthedash.com reference data'],
  }),
  op({
    id: 'opp-007',
    title: 'ThinkPad X1 Carbon G9, i7/16GB/1TB — business lease return',
    description:
      'Lease return in graded A condition with warranty remaining. Typical corporate batch arrives monthly; price cut to clear last 12 units.',
    category: 'electronics',
    source_marketplace: 'eBay',
    source_url: 'https://www.ebay.de/itm/leica-thinkpad-x1c-g9/301112838',
    current_price: 649,
    previous_price: 799,
    estimated_market_value: 780,
    deal_score: 87,
    match_score: 90,
    discoveredDaysAgo: 1,
    checkedHoursAgo: 6,
    attributes: { brand: 'Lenovo', model: 'ThinkPad X1 Carbon G9', cpu: 'i7-1165G7', ram: '16GB', storage: '1TB', condition: 'Grade A', warranty_months: 9 },
    evidence: ['ebay.de completed listings X1C G9', 'notebookcheck price tracking'],
  }),
  op({
    id: 'opp-008',
    title: 'Altbau 1-room apartment Neukölln — probate sale',
    description:
      'Probate sale in a well-kept Altbau. Small unit, immediate handover, priced for a quick close. Strong rental demand on this street.',
    category: 'real_estate',
    source_marketplace: 'Kleinanzeigen',
    source_url: 'https://www.kleinanzeigen.de/s-anzeige/altbau-neukoelln-erbengemeinschaft/28110934',
    current_price: 189000,
    previous_price: 205000,
    estimated_market_value: 214000,
    deal_score: 85,
    match_score: 82,
    status: 'new',
    discoveredDaysAgo: 2,
    checkedHoursAgo: 4,
    attributes: { exposure: 'street', condition: 'well-kept', energy_class: 'F' },
    real_estate: {
      city: 'Berlin',
      neighborhood: 'Neukölln',
      property_type: 'Apartment',
      bedrooms: 1,
      area_m2: 38,
      year_built: 1912,
      est_rent_monthly: 690,
      gross_yield_pct: 4.4,
      expenses_monthly: 140,
      net_yield_pct: 3.5,
    },
    evidence: ['kleinanzeigen.de listing 28110934', 'berlin.de Bodenrichtwerte Neukölln'],
  }),
];

/* --------------------------- Generated remainder ---------------------------- */

interface GenSpec {
  category: Category;
  titles: string[];
  sources: [string, string][];
  base: [number, number];
  attrFields: Record<string, (i: number) => string | number | boolean>;
  evidenceHosts: string[];
}

const GEN_SPECS: GenSpec[] = [
  {
    category: 'real_estate',
    titles: [
      '2-room apartment Kreuzberg — courtyard, vacant on transfer',
      'Condo Mitte, 2 rooms with balcony — below Kaufpreisindex',
      'Charlottenburg 3-room flat, refurbished 2024',
      'Wedding Altbau 2-room — estate sale, quick close',
      'Schöneberg 1-room — tenant at below-market rent, upside on expiry',
      'Friedrichshain studio near Ostkreuz — probate',
      'Köpenick family apartment, 4 rooms, garden share',
      'Moabit 2-room with cellar — quiet street',
      'Pankow 3-room new build — developer clearance on last unit',
      'Tempelhof 2-room — auction follow-up listing',
    ],
    sources: [
      ['ImmobilienScout24', 'https://www.immobilienscout24.de/expose/14{N}'],
      ['Kleinanzeigen', 'https://www.kleinanzeigen.de/s-anzeige/{S}'],
      ['Zillow (US ref)', 'https://www.zillow.com/homedetails/{N}_zpid/'],
    ],
    base: [145000, 420000],
    attrFields: {
      condition: (i) => (['renovated', 'well-kept', 'needs updating', 'refurbished 2024'] as const)[i % 4],
      exposure: (i) => (['courtyard', 'street', 'garden'] as const)[i % 3],
      balcony: (i) => i % 2 === 0,
    },
    evidenceHosts: ['immobilienscout24.de expose', 'berlin.de Bodenrichtwerte', 'emiya rent index'],
  },
  {
    category: 'watches',
    titles: [
      'Rolex Submariner Date 116610LN — full set',
      'Tudor Black Bay 58 — under reference band',
      'Seiko SKX007 — collector service, all original',
      'Breitling Navitimer 01 — box & papers',
      'IWC Mark XVIII — lease-return from dealer',
      'Grand Seiko SBGA211 "Snowflake" — mint',
      'Panerai Luminor Marina 195 — serviced',
      'Junghans Max Bill — agent sale, tiny mark',
    ],
    sources: [
      ['Chrono24', 'https://www.chrono24.de/{S}/id28{N}.htm'],
      ['eBay', 'https://www.ebay.de/itm/{N}'],
      ['Kleinanzeigen', 'https://www.kleinanzeigen.de/s-anzeige/{S}'],
    ],
    base: [900, 9000],
    attrFields: {
      condition: (i) => (['Excellent', 'Very good', 'Good', 'Mint'] as const)[i % 4],
      box_papers: (i) => i % 3 !== 2,
      movement: (i) => (['Automatic', 'Manual', 'Automatic'] as const)[i % 3],
    },
    evidenceHosts: ['chrono24 price band', 'watchcharts.com model page', 'watchuseek sales corner'],
  },
  {
    category: 'cars_parts',
    titles: [
      'BMW E46 M3 CSL wheels — set of 4, refurbed',
      'Mercedes W123 door panel, driver side — NOS',
      'Audi B5 RS4 bumper, genuine — rare',
      'VW Golf Mk1 GTI round headlights, NOS pair',
      'Porsche 996 GT3 wing — take-off, undamaged',
      'Ford Escort Mk1 diff — rebuilt',
      'Alpina B10 wheels 20" — used, straight',
      'Air-cooled 911 Sport muffler — Dansk, new',
    ],
    sources: [
      ['eBay Motors', 'https://www.ebay.de/itm/{N}'],
      ['Kleinanzeigen', 'https://www.kleinanzeigen.de/s-anzeige/{S}'],
      ['Bring a Trailer', 'https://bringatrailer.com/listings/{S}'],
    ],
    base: [220, 3200],
    attrFields: {
      condition: (i) => (['New old stock', 'Used — very good', 'Refurbished', 'Take-off'] as const)[i % 4],
      genuine: (i) => i % 4 !== 3,
    },
    evidenceHosts: ['rennlist parts survey', 'ebay completed listings', 'model-specific forum market thread'],
  },
  {
    category: 'electronics',
    titles: [
      'MacBook Air M2 8/512 — open box, sealed',
      'Sony A7 III body — shutter count 9k',
      'iPhone 14 Pro 256GB — battery 94%',
      'DJI Mavic 3 Classic — fly-more combo',
      'Kindle Scribe — returned, unopened',
      'LG C3 55" OLED — display model, full warranty',
    ],
    sources: [
      ['Amazon Warehouse', 'https://www.amazon.de/dp/{S}'],
      ['eBay', 'https://www.ebay.de/itm/{N}'],
      ['Kleinanzeigen', 'https://www.kleinanzeigen.de/s-anzeige/{S}'],
    ],
    base: [180, 1500],
    attrFields: {
      condition: (i) => (['Open box', 'Grade A', 'Like new', 'Display unit'] as const)[i % 4],
      warranty_months: (i) => [12, 9, 6, 0][i % 4],
    },
    evidenceHosts: ['idealo.de price history', 'amazon.de warehouse listing', 'ebay completed listings'],
  },
  {
    category: 'home_living',
    titles: [
      'USM Haller sideboard, 6 flaps — pearl grey',
      'Wegner CH24 "Wishbone" chair, pair — oiled oak',
      'Flos Arco floor lamp — marble base, 2nd generation',
      'Gubi Beetle dining chairs, set of 4',
      'Zanotta Sacco beanbag — designer overstock',
      'Fritz Hansen Series 7 chair, 4x — lacquered',
    ],
    sources: [
      ['eBay', 'https://www.ebay.de/itm/{N}'],
      ['Kleinanzeigen', 'https://www.kleinanzeigen.de/s-anzeige/{S}'],
      ['1stDibs (ref)', 'https://www.1stdibs.com/furniture/{S}'],
    ],
    base: [150, 3800],
    attrFields: {
      condition: (i) => (['Very good', 'Good', 'As new'] as const)[i % 3],
      era: (i) => (['Vintage', 'Contemporary', 'New'] as const)[i % 3],
    },
    evidenceHosts: ['pamono reference listing', 'ebay sold listings', 'designer furniture price guide'],
  },
];

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 28);
}

function buildGenerated(): SeedOpp[] {
  const rows: SeedOpp[] = [];
  // 48 total: 8 canonical (2 real_estate, 2 watches...) + 40 generated spread per spec.
  const perSpec = [11, 8, 8, 7, 6]; // sums to 40; +8 canonical = 48 total
  let n = 8;
  GEN_SPECS.forEach((spec, si) => {
    for (let i = 0; i < perSpec[si]; i++) {
      const title = spec.titles[i % spec.titles.length] + (i >= spec.titles.length ? ' — second listing' : '');
      const [market, urlTpl] = spec.sources[i % spec.sources.length];
      const url = urlTpl
        .replace('{N}', String(260000000 + Math.floor(rand() * 9000000)))
        .replace('{S}', slugify(title));
      const base = Math.round(between(spec.base[0], spec.base[1]) / 10) * 10;
      const drop = rand() < 0.55;
      const previous = drop ? Math.round(base * between(1.06, 1.28)) : undefined;
      const estimate = Math.round(base * between(1.04, 1.18));
      const gap = ((estimate - base) / estimate) * 100;
      const dealScore = Math.min(96, Math.round(45 + gap * 2.4 + (drop ? 14 : 0) + between(-6, 10)));
      const matchScore = Math.round(between(64, 97));
      const statusPool: OpportunityStatus[] = ['new', 'new', 'new', 'shortlisted', 'under_review', 'dismissed', 'purchased'];
      const attributes: Record<string, string | number | boolean> = {};
      for (const [k, fn] of Object.entries(spec.attrFields)) attributes[k] = fn(i);
      if (spec.category === 'watches') {
        attributes.year = 2010 + (i % 14);
        attributes.brand = title.split(' ')[0];
      }
      if (spec.category === 'cars_parts') {
        attributes.make = title.split(' ')[0];
        attributes.fitment = 'OEM or better';
      }
      if (spec.category === 'electronics') {
        attributes.brand = title.split(' ')[0];
      }
      if (spec.category === 'home_living') {
        attributes.brand = pick(['Vitra', 'Fritz Hansen', 'USM', 'Gubi', 'Flos', 'Louis Poulsen']);
      }
      if (spec.category === 'real_estate') {
        const city = pick(['Berlin', 'Berlin', 'Berlin', 'Hamburg', 'Leipzig']);
        const neighborhoods: Record<string, string[]> = {
          Berlin: ['Kreuzberg', 'Mitte', 'Charlottenburg', 'Wedding', 'Schöneberg', 'Friedrichshain', 'Köpenick', 'Moabit', 'Pankow', 'Tempelhof', 'Prenzlauer Berg', 'Neukölln'],
          Hamburg: ['Altona', 'St. Georg', 'Barmbek'],
          Leipzig: ['Plagwitz', 'Connewitz', 'Zentrum-West'],
        };
        const neighborhood = pick(neighborhoods[city]);
        const areaM2 = Math.round(between(34, 96));
        const rent = Math.round((base / areaM2) * between(14, 20) * areaM2 * 0.034);
        const grossYield = Number((((rent * 12) / base) * 100).toFixed(1));
        attributes.rooms = 1 + (i % 4);
        const realEstate: RealEstateAttributes = {
          city,
          neighborhood,
          property_type: pick(['Apartment', 'Condo']),
          bedrooms: 1 + (i % 4),
          area_m2: areaM2,
          year_built: 1900 + Math.floor(rand() * 118),
          est_rent_monthly: rent,
          gross_yield_pct: grossYield,
          expenses_monthly: Math.round(rent * 0.18),
          net_yield_pct: Number((grossYield - 1.0 + rand() * 0.4).toFixed(1)),
        };
        rows.push({
          id: `opp-${String(++n).padStart(3, '0')}`,
          title,
          description: `${neighborhood} listing monitored for ${city} investors. Price tracked against local reference values; yield computed from listed rent and asking price. Illustrative estimate, not investment advice.`,
          category: spec.category,
          source_marketplace: market,
          source_url: url,
          current_price: base,
          previous_price: previous,
          estimated_market_value: estimate,
          deal_score: dealScore,
          match_score: matchScore,
          status: statusPool[Math.floor(rand() * statusPool.length)],
          discoveredDaysAgo: Math.floor(between(0, 26)),
          checkedHoursAgo: Math.floor(between(1, 40)),
          attributes,
          real_estate: realEstate,
          evidence: spec.evidenceHosts,
        });
        continue;
      }
      rows.push({
        id: `opp-${String(++n).padStart(3, '0')}`,
        title,
        description: `Tracked across ${spec.evidenceHosts[0]} and ${spec.evidenceHosts[1] ?? 'market forums'}. Price moves are computed from the last 30 days of observations. Reference values are illustrative estimates, not appraisals.`,
        category: spec.category,
        source_marketplace: market,
        source_url: url,
        current_price: base,
        previous_price: previous,
        estimated_market_value: estimate,
        deal_score: dealScore,
        match_score: matchScore,
        status: statusPool[Math.floor(rand() * statusPool.length)],
        discoveredDaysAgo: Math.floor(between(0, 26)),
        checkedHoursAgo: Math.floor(between(1, 40)),
        attributes,
        evidence: spec.evidenceHosts,
      });
    }
  });
  return rows;
}

export const SEED_OPPORTUNITIES: SeedOpp[] = [...CANONICAL, ...buildGenerated()];

/* ------------------------------ Monitors seed ------------------------------- */

const SEED_MONITORS: Array<{
  id: string;
  name: string;
  description: string;
  category: Category;
  sensitivity: MonitorSensitivity;
  frequency: number;
  status: 'active' | 'paused';
  priceDropOnly?: boolean;
  keywords: string[];
  priceMin?: number;
  priceMax?: number;
}> = [
  {
    id: 'mon-001',
    name: 'Berlin apartments under €350k',
    description: 'Apartments in Berlin-Friedrichshain and nearby districts under €350k with estimated gross yield above 5.5%. Vacant or expiring tenancies preferred.',
    category: 'real_estate',
    sensitivity: 'balanced',
    frequency: 30,
    status: 'active',
    keywords: ['apartment', 'wohnung', 'altbau'],
    priceMax: 350000,
  },
  {
    id: 'mon-002',
    name: 'Omega Seamaster below €4,000',
    description: 'Seamaster Diver 300M, excellent condition or better, box and papers required. Flags listings below the €4,000 reference band.',
    category: 'watches',
    sensitivity: 'strict',
    frequency: 30,
    status: 'active',
    keywords: ['seamaster', 'omega 300m'],
    priceMax: 4000,
  },
  {
    id: 'mon-003',
    name: 'Porsche 911 (997) OEM parts',
    description: 'Genuine OEM parts for the 997 generation. Alerts while the listing is still live — these typically sell within hours.',
    category: 'cars_parts',
    sensitivity: 'broad',
    frequency: 5,
    status: 'active',
    keywords: ['997', 'porsche oem'],
    priceDropOnly: true,
  },
  {
    id: 'mon-004',
    name: 'ThinkPad X1 Carbon Grade A',
    description: 'Business lease returns, Grade A or better, i7 / 16GB minimum. Flags price drops on current stock.',
    category: 'electronics',
    sensitivity: 'balanced',
    frequency: 60,
    status: 'active',
    keywords: ['x1 carbon', 'thinkpad'],
    priceMin: 400,
    priceMax: 900,
  },
  {
    id: 'mon-005',
    name: 'Mid-century lounge chairs',
    description: 'Eames, Wegner and similar mid-century lounge chairs and ottomans, original manufacturers only.',
    category: 'home_living',
    sensitivity: 'broad',
    frequency: 180,
    status: 'paused',
    keywords: ['lounge chair', 'eames', 'wegner', 'ottoman'],
  },
  {
    id: 'mon-006',
    name: 'Rolex Submariner — reference-band deals',
    description: 'Submariner 116610/126610 below the 30-day reference band with full set. Watch for quick flips and service gaps.',
    category: 'watches',
    sensitivity: 'strict',
    frequency: 15,
    status: 'active',
    keywords: ['submariner', 'rolex'],
  },
];

/* ---------------------------- Insertion helpers ----------------------------- */

/** Evidence labels become functional reference-search URLs (honest: they open
 *  a search for the cited source/reference, not a fabricated deep link). */
function evidenceUrl(label: string, title: string): string {
  const knownDomain = label.match(/^([a-z0-9.-]+\.[a-z]{2,})(\/[\w./-]*)?$/i);
  if (knownDomain) return `https://${knownDomain[0]}`;
  return `https://duckduckgo.com/?q=${encodeURIComponent(`${label} ${title}`)}`;
}

function insertPlans(db: Db): void {
  const stmt = db.prepare(
    `INSERT OR IGNORE INTO plans (code, name, monitor_limit, collection_limit, comparison_limit, price_monthly_eur, refresh_label, features)
     VALUES (@code, @name, @monitor_limit, @collection_limit, @comparison_limit, @price, @refresh, @features)`
  );
  const plans: Array<{
    code: PlanCode;
    name: string;
    monitor_limit: number;
    collection_limit: number;
    comparison_limit: number;
    price: number;
    refresh: string;
    features: string[];
  }> = [
    {
      code: 'free',
      name: 'Free',
      monitor_limit: 3,
      collection_limit: 2,
      comparison_limit: 2,
      price: 0,
      refresh: 'Daily refresh',
      features: ['3 monitors', 'Daily refresh', '2 collections', '30-day price history', 'In-app alerts', 'Compare 2 items'],
    },
    {
      code: 'pro',
      name: 'Pro',
      monitor_limit: 20,
      collection_limit: -1,
      comparison_limit: 4,
      price: 99,
      refresh: '30-minute refresh',
      features: ['20 monitors', '30-minute refresh', 'Unlimited collections', '1-year price history', 'In-app + email alerts', 'Compare 4 items', 'Market insights'],
    },
    {
      code: 'scale',
      name: 'Scale',
      monitor_limit: 100,
      collection_limit: -1,
      comparison_limit: 4,
      price: 249,
      refresh: '5-minute refresh',
      features: ['100 monitors', '5-minute refresh', 'Unlimited collections', '2-year price history', 'In-app + email + webhook alerts', 'Compare 4 items', 'Priority support', 'API access (coming soon)'],
    },
  ];
  for (const p of plans) stmt.run({ ...p, features: JSON.stringify(p.features) });
}

export function seedGlobals(db: Db): void {
  insertPlans(db);

  const oppStmt = db.prepare(
    `INSERT INTO opportunities (id, user_id, title, description, category, image_url, source_marketplace, source_url,
      current_price, currency, previous_price, estimated_market_value, price_change_pct, deal_score, match_score,
      status, discovered_at, last_checked_at, is_sample, is_interesting, attributes, real_estate, evidence_links)
     VALUES (@id, NULL, @title, @description, @category, @image_url, @source_marketplace, @source_url,
      @current_price, 'EUR', @previous_price, @estimated_market_value, @price_change_pct, @deal_score, @match_score,
      @status, @discovered_at, @last_checked_at, 1, @is_interesting, @attributes, @real_estate, @evidence_links)`
  );

  const historyStmt = db.prepare(
    `INSERT INTO price_history (opportunity_id, date, price) VALUES (?, ?, ?)`
  );

  const videoStmt = db.prepare(
    `INSERT INTO video_reviews (id, user_id, title, source, source_url, duration, opportunity_id, category, is_sample, created_at)
     VALUES (@id, NULL, @title, @source, @source_url, @duration, @opportunity_id, @category, 1, @created_at)`
  );

  const tx = db.transaction(() => {
    for (const o of SEED_OPPORTUNITIES) {
      const change =
        o.previous_price != null
          ? Number((((o.current_price - o.previous_price) / o.previous_price) * 100).toFixed(1))
          : null;
      oppStmt.run({
        id: o.id,
        title: o.title,
        description: o.description,
        category: o.category,
        image_url: null,
        source_marketplace: o.source_marketplace,
        source_url: o.source_url,
        current_price: o.current_price,
        previous_price: o.previous_price ?? null,
        estimated_market_value: o.estimated_market_value,
        price_change_pct: change,
        deal_score: o.deal_score,
        match_score: o.match_score,
        status: o.status ?? 'new',
        discovered_at: daysAgo(o.discoveredDaysAgo, o.checkedHoursAgo % 24),
        last_checked_at: daysAgo(0, o.checkedHoursAgo),
        is_interesting: o.id === 'opp-002' || o.id === 'opp-007' ? 1 : 0,
        attributes: JSON.stringify(o.attributes),
        real_estate: o.real_estate ? JSON.stringify(o.real_estate) : null,
        evidence_links: JSON.stringify(o.evidence.map((e) => evidenceUrl(e, o.title))),
      });

      // Price history: 5-9 points over the last 30 days ending at current price.
      const points = 5 + Math.floor(rand() * 5);
      const startBase = o.previous_price ?? o.current_price * between(1.02, 1.15);
      for (let p = 0; p < points; p++) {
        const t = p / (points - 1);
        const price = Math.round(startBase * (1 - t) + o.current_price * t + between(-0.015, 0.015) * o.current_price);
        const date = daysAgo(Math.round(30 - t * 30), 0).slice(0, 10);
        historyStmt.run(o.id, date, Math.max(Math.round(price), Math.round(o.current_price * 0.7)));
      }
      // Ensure the final point is exactly today's price.
      historyStmt.run(o.id, new Date().toISOString().slice(0, 10), o.current_price);
    }

    const videos: Array<{ id: string; title: string; source: string; source_url: string; duration: string; opportunity_id: string | null; category: Category; created: number }> = [
      { id: 'vid-001', title: 'Buying in Friedrichshain: a walkthrough of three listings', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=berlin+friedrichshain+apartment+tour', duration: '14:22', opportunity_id: 'opp-001', category: 'real_estate', created: 6 },
      { id: 'vid-002', title: 'Omega Seamaster 300M — one year on the wrist', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=omega+seamaster+300m+review', duration: '18:05', opportunity_id: 'opp-002', category: 'watches', created: 9 },
      { id: 'vid-003', title: 'Porsche 997 buyer’s guide: what to check', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=porsche+997+buyer+guide', duration: '26:41', opportunity_id: 'opp-003', category: 'cars_parts', created: 12 },
      { id: 'vid-004', title: 'Eames lounge: real vs replica — how to tell', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=eames+lounge+chair+original+vs+replica', duration: '11:37', opportunity_id: 'opp-005', category: 'home_living', created: 3 },
      { id: 'vid-005', title: 'Heuer Carrera 2447 — auction story', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=heuer+carrera+2447', duration: '9:58', opportunity_id: 'opp-006', category: 'watches', created: 15 },
      { id: 'vid-006', title: 'ThinkPad X1 Carbon G9 long-term review', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=thinkpad+x1+carbon+gen+9+review', duration: '21:12', opportunity_id: 'opp-007', category: 'electronics', created: 4 },
      { id: 'vid-007', title: 'Berlin rental yields explained — numbers on screen', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=berlin+rental+yield+explained', duration: '16:48', opportunity_id: null, category: 'real_estate', created: 20 },
      { id: 'vid-008', title: 'Watch box tour: divers under €5,000', source: 'YouTube', source_url: 'https://www.youtube.com/results?search_query=best+diver+watches+under+5000', duration: '13:30', opportunity_id: null, category: 'watches', created: 8 },
    ];
    for (const v of videos) {
      videoStmt.run({
        id: v.id,
        title: v.title,
        source: v.source,
        source_url: v.source_url,
        duration: v.duration,
        opportunity_id: v.opportunity_id,
        category: v.category,
        created_at: daysAgo(v.created),
      });
    }
  });
  tx();

  // Demo account last: its seeded notifications/collections reference the
  // global opportunities inserted above (FK-linked demo content).
  seedDemoAccount(db);
}

/** Fixed demo account on every instance (serverless-friendly login). */
function seedDemoAccount(db: Db): void {
  const demo = { id: 'usr-demo-fixed', email: 'demo@orbit.test', password: 'orbit-demo-2026', name: 'Demo Operator' };
  db.prepare("INSERT OR IGNORE INTO users (id, email, password_hash, email_confirmed_at) VALUES (?, ?, ?, datetime('now'))")
    .run(demo.id, demo.email, hashPassword(demo.password));
  db.prepare('INSERT OR IGNORE INTO profiles (id, email, full_name) VALUES (?, ?, ?)').run(demo.id, demo.email, demo.name);
  const hasContent = (db.prepare('SELECT 1 AS x FROM monitors WHERE user_id = ? LIMIT 1').get(demo.id) as { x: number } | undefined);
  if (!hasContent) seedUserContentInner(db, demo.id, 'pro');
}

export function seedUserContent(db: Db, userId: string, planCode: 'free' | 'pro' = 'pro'): void {
  seedUserContentInner(db, userId, planCode);
}

function seedUserContentInner(db: Db, userId: string, planCode: 'free' | 'pro'): void {
  const insertMonitor = db.prepare(
    `INSERT INTO monitors (id, user_id, name, description, category, criteria, sensitivity, frequency_minutes,
      notify_in_app, notify_email, digest_mode, price_drop_only, status, match_count, last_checked_at, created_at)
     VALUES (@id, @user_id, @name, @description, @category, @criteria, @sensitivity, @frequency_minutes,
      1, 0, @digest_mode, @price_drop_only, @status, @match_count, @last_checked_at, @created_at)`
  );

  const insertNotification = db.prepare(
    `INSERT INTO notifications (id, user_id, type, title, body, opportunity_id, monitor_id, is_read, created_at)
     VALUES (@id, @user_id, @type, @title, @body, @opportunity_id, @monitor_id, @is_read, @created_at)`
  );

  const insertActivity = db.prepare(
    `INSERT INTO activity_events (id, user_id, kind, payload, created_at)
     VALUES (@id, @user_id, @kind, @payload, @created_at)`
  );

  const insertCollection = db.prepare(
    `INSERT INTO collections (id, user_id, name, created_at) VALUES (@id, @user_id, @name, @created_at)`
  );

  const insertCollectionItem = db.prepare(
    `INSERT OR IGNORE INTO collection_items (collection_id, opportunity_id, added_at) VALUES (?, ?, ?)`
  );

  const subscription = db.prepare(
    `INSERT OR REPLACE INTO subscriptions (user_id, plan_code, status, current_period_end)
     VALUES (?, ?, 'active', ?)`
  );

  const oppIdsByCategory = (cat: Category): string[] =>
    (db.prepare(`SELECT id FROM opportunities WHERE category = ? AND user_id IS NULL`).all(cat) as Array<{ id: string }>).map(
      (r) => r.id
    );

  const tx = db.transaction(() => {
    // Monitors with plausible match counts.
    const monitorRows = SEED_MONITORS.map((m, i) => {
      const crit: Record<string, unknown> = { keywords: m.keywords, excluded_terms: [], required_attributes: {} };
      if (m.priceMin != null) crit.price_min = m.priceMin;
      if (m.priceMax != null) crit.price_max = m.priceMax;
      return {
        id: `${m.id}-${userId.slice(0, 6)}`,
        user_id: userId,
        name: m.name,
        description: m.description,
        category: m.category,
        criteria: JSON.stringify(crit),
        sensitivity: m.sensitivity,
        frequency_minutes: m.frequency,
        digest_mode: i === 4 ? 1 : 0,
        price_drop_only: m.priceDropOnly ? 1 : 0,
        status: m.status,
        match_count: Math.floor(between(2, 24)),
        last_checked_at: daysAgo(0, (i + 1) * 2),
        created_at: daysAgo(24 - i * 3),
      };
    });
    for (const m of monitorRows) insertMonitor.run(m);

    // Notifications: 15, 5 unread, linked to real opportunities/monitors.
    const reIds = oppIdsByCategory('real_estate');
    const watchIds = oppIdsByCategory('watches');
    const carIds = oppIdsByCategory('cars_parts');
    const elecIds = oppIdsByCategory('electronics');
    const notifTemplates: Array<{ type: NotificationType; title: string; body: string; opp: string | null; mon: string | null; unread: boolean; days: number; hours: number }> = [
      { type: 'new_match', title: '2 new matches — Berlin apartments under €350k', body: '“2-Zimmer-Wohnung, Friedrichshain” and “Altbau 1-room Neukölln” match your monitor criteria.', opp: reIds[0] ?? null, mon: monitorRows[0].id, unread: true, days: 0, hours: 2 },
      { type: 'price_drop', title: 'Price drop: Omega Seamaster Diver 300M', body: '€4,150 → €3,850 (−7.2%). Below the reference band of €4,300.', opp: watchIds[0] ?? null, mon: monitorRows[1].id, unread: true, days: 0, hours: 5 },
      { type: 'availability', title: 'Porsche 997 OEM headlight back in stock', body: 'New old stock listing appeared on Kleinanzeigen — these usually sell within hours.', opp: carIds[0] ?? null, mon: monitorRows[2].id, unread: true, days: 1, hours: 1 },
      { type: 'new_match', title: '3 new matches — ThinkPad X1 Carbon', body: 'Fresh lease-return batch matched your criteria with deal scores above 80.', opp: elecIds[0] ?? null, mon: monitorRows[3].id, unread: true, days: 1, hours: 7 },
      { type: 'monitor_update', title: 'Monitor paused: Mid-century lounge chairs', body: 'You paused this monitor. Resume any time to continue tracking.', opp: null, mon: monitorRows[4].id, unread: true, days: 2, hours: 3 },
      { type: 'price_drop', title: 'Price drop: Eames Lounge & Ottoman', body: '€3,990 → €3,450 (−13.5%). Second reduction in 30 days.', opp: 'opp-005', mon: monitorRows[4].id, unread: false, days: 3, hours: 4 },
      { type: 'new_match', title: 'New match — Rolex Submariner 116610LN', body: 'Full set listing appeared below the 30-day reference band.', opp: watchIds[1] ?? null, mon: monitorRows[5].id, unread: false, days: 4, hours: 2 },
      { type: 'monitor_update', title: 'Monitor checked: 12 sources scanned', body: 'No new matches in the last run. Next check in 30 minutes (simulated).', opp: null, mon: monitorRows[0].id, unread: false, days: 5, hours: 1 },
      { type: 'price_drop', title: 'Price drop: Altbau 1-room Neukölln', body: '€205,000 → €189,000 (−7.8%). Probate sale, motivated heirs.', opp: reIds.find((id) => id !== (reIds[0] ?? '')) ?? null, mon: monitorRows[0].id, unread: false, days: 6, hours: 6 },
      { type: 'new_match', title: 'New match — Vintage Eames Lounge', body: 'Matched “Mid-century lounge chairs” with sensitivity broad.', opp: 'opp-005', mon: monitorRows[4].id, unread: false, days: 8, hours: 2 },
      { type: 'monitor_update', title: 'Digest: 4 matches in the last 24h', body: 'Daily digest for your 5 active monitors. Open ORBIT to review.', opp: null, mon: null, unread: false, days: 9, hours: 9 },
      { type: 'availability', title: 'Back in stock: ThinkPad X1 Carbon', body: 'Amazon Warehouse restocked Grade A units at €649.', opp: elecIds[1] ?? null, mon: monitorRows[3].id, unread: false, days: 11, hours: 4 },
      { type: 'price_drop', title: 'Price drop: Heuer Carrera 2447', body: '€7,900 → €7,200 (−8.9%). Private sale, collector direct.', opp: 'opp-006', mon: monitorRows[5].id, unread: false, days: 13, hours: 5 },
      { type: 'new_match', title: '2 new matches — Porsche 997 parts', body: 'A pair of listings matched your OEM parts monitor.', opp: carIds[1] ?? null, mon: monitorRows[2].id, unread: false, days: 16, hours: 8 },
      { type: 'monitor_update', title: 'Welcome to ORBIT Intelligence', body: 'Your workspace is ready: 6 demo monitors are watching sample sources for you.', opp: null, mon: null, unread: false, days: 24, hours: 10 },
    ];
    notifTemplates.forEach((n, i) => {
      insertNotification.run({
        id: `ntf-${String(i + 1).padStart(3, '0')}-${userId.slice(0, 6)}`,
        user_id: userId,
        type: n.type,
        title: n.title,
        body: n.body,
        opportunity_id: n.opp,
        monitor_id: n.mon,
        is_read: n.unread ? 0 : 1,
        created_at: daysAgo(n.days, n.hours),
      });
    });

    // Activity: 20 events.
    const activityTemplates: Array<{ kind: ActivityKind; payload: Record<string, unknown>; days: number; hours: number }> = [
      { kind: 'monitor_created', payload: { name: 'Berlin apartments under €350k' }, days: 24, hours: 1 },
      { kind: 'monitor_created', payload: { name: 'Omega Seamaster below €4,000' }, days: 23, hours: 2 },
      { kind: 'status_changed', payload: { title: '2-Zimmer-Wohnung Friedrichshain', status: 'shortlisted' }, days: 22, hours: 3 },
      { kind: 'search_saved', payload: { query: 'seamaster diver', category: 'watches' }, days: 20, hours: 5 },
      { kind: 'monitor_created', payload: { name: 'Porsche 911 (997) OEM parts' }, days: 19, hours: 1 },
      { kind: 'collection_created', payload: { name: 'Watch Wishlist' }, days: 18, hours: 4 },
      { kind: 'added_to_collection', payload: { collection: 'Watch Wishlist', title: 'Omega Seamaster Diver 300M' }, days: 18, hours: 5 },
      { kind: 'monitor_created', payload: { name: 'ThinkPad X1 Carbon Grade A' }, days: 15, hours: 2 },
      { kind: 'status_changed', payload: { title: 'Eames Lounge Chair & Ottoman', status: 'under_review' }, days: 13, hours: 6 },
      { kind: 'monitor_created', payload: { name: 'Mid-century lounge chairs' }, days: 12, hours: 3 },
      { kind: 'collection_created', payload: { name: 'Dream Home Investments' }, days: 11, hours: 2 },
      { kind: 'added_to_collection', payload: { collection: 'Dream Home Investments', title: '2-Zimmer-Wohnung, Friedrichshain' }, days: 11, hours: 3 },
      { kind: 'monitor_paused', payload: { name: 'Mid-century lounge chairs' }, days: 9, hours: 4 },
      { kind: 'status_changed', payload: { title: 'Heuer Carrera 2447', status: 'dismissed' }, days: 7, hours: 2 },
      { kind: 'monitor_created', payload: { name: 'Rolex Submariner — reference-band deals' }, days: 6, hours: 1 },
      { kind: 'added_to_collection', payload: { collection: 'Rare Car Parts', title: 'Porsche 911 (997) OEM headlight' }, days: 4, hours: 5 },
      { kind: 'monitor_resumed', payload: { name: 'Porsche 911 (997) OEM parts' }, days: 3, hours: 2 },
      { kind: 'bulk_status_changed', payload: { count: 3, status: 'dismissed' }, days: 2, hours: 6 },
      { kind: 'added_to_collection', payload: { collection: 'Home Upgrade', title: 'USM Haller sideboard' }, days: 1, hours: 3 },
      { kind: 'profile_updated', payload: { section: 'notifications' }, days: 0, hours: 4 },
    ];
    activityTemplates.forEach((a, i) => {
      insertActivity.run({
        id: `act-${String(i + 1).padStart(3, '0')}-${userId.slice(0, 6)}`,
        user_id: userId,
        kind: a.kind,
        payload: JSON.stringify(a.payload),
        created_at: daysAgo(a.days, a.hours),
      });
    });

    // Collections with items referencing global opportunities.
    const collections: Array<{ id: string; name: string; created: number; items: string[] }> = [
      { id: `col-001-${userId.slice(0, 6)}`, name: 'Dream Home Investments', created: 11, items: [reIds[0], reIds[1], reIds[2], reIds[3]].filter(Boolean).slice(0, 4) },
      { id: `col-002-${userId.slice(0, 6)}`, name: 'Watch Wishlist', created: 18, items: [watchIds[0], watchIds[1], watchIds[2]].filter(Boolean).slice(0, 3) },
      { id: `col-003-${userId.slice(0, 6)}`, name: 'Rare Car Parts', created: 14, items: [carIds[0], carIds[1]].filter(Boolean).slice(0, 2) },
      { id: `col-004-${userId.slice(0, 6)}`, name: 'Home Upgrade', created: 10, items: ['opp-005'].filter(Boolean) },
    ];
    for (const c of collections) {
      insertCollection.run({ id: c.id, user_id: userId, name: c.name, created_at: daysAgo(c.created) });
      c.items.forEach((oppId, i) => {
        if (oppId) insertCollectionItem.run(c.id, oppId, daysAgo(c.created - i * 0.2));
      });
    }

    // Subscription: demo user lands on Pro; new signups default to Free.
    const periodEnd = new Date(Date.now() + 30 * 86_400_000).toISOString().slice(0, 10);
    subscription.run(userId, planCode, periodEnd);
  });
  tx();
}
