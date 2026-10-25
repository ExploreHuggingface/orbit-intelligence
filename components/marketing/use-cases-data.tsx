/* Use-case content (plan §19) with persona stories from plan §2. */
import { Building2, Search, Wrench, type LucideIcon } from 'lucide-react';

export interface UseCase {
  slug: string;
  title: string;
  heading: string;
  icon: LucideIcon;
  story: string;
  timeline: Array<{ time: string; title: string; body: string }>;
  outcomes: string[];
}

export const USE_CASES: UseCase[] = [
  {
    slug: 'real-estate',
    title: 'Real Estate',
    heading: 'Yield-first property hunting, without the portal refresh',
    icon: Building2,
    story:
      'Apartments in Berlin-Friedrichshain under €350k with estimated gross yield above 5.5%. ORBIT monitors sources continuously, scores each new listing, and pushes a notification with the deal analysis computed — reference band, price per m², gross and net yields.',
    timeline: [
      {
        time: '08:40',
        title: 'Overnight check runs',
        body: 'Your monitor scanned ImmobilienScout24 and Kleinanzeigen overnight. Three new listings match; two score above 80.',
      },
      {
        time: '08:52',
        title: 'The one that matters arrives',
        body: 'A probate sale in Neukölln lists 7.8% below your reference band. The notification links straight to the record with yields computed.',
      },
      {
        time: '09:15',
        title: 'Compare and decide',
        body: 'You drop it next to two Prenzlauer Berg condos in a comparison. Price per m², rent estimate and net yield line up — the probate unit wins on every row.',
      },
      {
        time: '09:31',
        title: 'From alert to enquiry',
        body: 'You open the source listing from the record’s evidence links and send the enquiry. First mover, by a margin you can measure.',
      },
    ],
    outcomes: [
      'Every new listing scored before you see it',
      'Gross and net yields computed per property',
      'Reference bands with linked evidence',
      'Comparison across up to 4 properties',
      'Price-drop alerts on watched listings',
      'Search history and saved queries for repeat hunts',
    ],
  },
  {
    slug: 'collectors',
    title: 'Watches & Collectors',
    heading: 'The outlier finds you',
    icon: Search,
    story:
      'An Omega Seamaster below €4,000 in excellent condition with box and papers. ORBIT compares each listing to a reference price band and flags meaningful outliers — so you read about the 7% under-band listing, not the fifty priced correctly.',
    timeline: [
      {
        time: 'Tue 14:05',
        title: 'Reference bands stay current',
        body: 'ORBIT tracks every Seamaster 300M listing in your price window and keeps the reference band from recent observations.',
      },
      {
        time: 'Tue 14:07',
        title: 'A blip appears',
        body: 'A full-set 2018 example lists at €3,850 — 7.2% under band and dropping. Strict sensitivity matched condition and box & papers.',
      },
      {
        time: 'Tue 14:09',
        title: 'Two minutes to conviction',
        body: 'The record shows the price history, the evidence links, and the deal score of 82. You’ve seen this movie; you know how it ends.',
      },
      {
        time: 'Tue 14:12',
        title: 'Message sent',
        body: 'You open Chrono24 from the source link and make contact. Listings like this typically close same-day.',
      },
    ],
    outcomes: [
      'Reference bands per reference number',
      'Condition and full-set criteria enforced',
      'Price-drop-only alert mode',
      'Collections for grail lists',
      'Price history on every tracked piece',
      'Market insights for the category',
    ],
  },
  {
    slug: 'deal-hunting',
    title: 'Deal Hunting',
    heading: 'For parts that sell in hours',
    icon: Wrench,
    story:
      'An OEM 911 (997) headlight that appears on forums and sells within hours. ORBIT watches sources, matches part number and condition, and alerts while the listing is still live — with broad sensitivity so the loose matches still surface.',
    timeline: [
      {
        time: '06:12',
        title: 'The early run',
        body: 'The 5-minute monitor sweep catches a fresh Kleinanzeigen listing posted at 06:04: NOS bi-xenon headlight, part number 997.631.476.03.',
      },
      {
        time: '06:13',
        title: 'Match, scored',
        body: 'Deal score 91: listed 26% under the parts-catalog reference. The notification is on your phone before your coffee.',
      },
      {
        time: '06:18',
        title: 'Pull the trigger',
        body: 'You message the seller from the listing link. Six minutes from posting to enquiry — the margin is the moat.',
      },
      {
        time: 'Later',
        title: 'The pipeline remembers',
        body: 'The part lands in your “Rare Car Parts” collection with status purchased. Next restoration, the history is one click away.',
      },
    ],
    outcomes: [
      'Broad sensitivity catches loose matches',
      'Part-number and condition matching',
      'Availability alerts for restocks',
      '5-minute refresh at the Scale tier',
      'Collections organized per project car',
      'Full activity log of what you did when',
    ],
  },
];
