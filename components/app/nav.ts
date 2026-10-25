/* App navigation config shared by sidebar, topbar breadcrumbs, and mobile drawer. */
import type { DictionaryKey } from '@/lib/i18n/dictionaries/en';
import {
  LayoutDashboard,
  Search,
  Sparkles,
  Radar,
  FolderOpen,
  GitCompareArrows,
  LineChart,
  History,
  PlaySquare,
  Bell,
  Activity,
  Plug,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** i18n key for this item (nav.<id>). */
  key: DictionaryKey;
}

export const NAV_SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', href: '/app/overview', icon: LayoutDashboard, key: 'nav.overview' },
      { id: 'discover', label: 'Discover', href: '/app/discover', icon: Search, key: 'nav.discover' },
      { id: 'opportunities', label: 'Opportunities', href: '/app/opportunities', icon: Sparkles, key: 'nav.opportunities' },
      { id: 'monitors', label: 'Monitors', href: '/app/monitors', icon: Radar, key: 'nav.monitors' },
      { id: 'collections', label: 'Collections', href: '/app/collections', icon: FolderOpen, key: 'nav.collections' },
      { id: 'comparisons', label: 'Comparisons', href: '/app/comparisons', icon: GitCompareArrows, key: 'nav.comparisons' },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'market-insights', label: 'Market Insights', href: '/app/market-insights', icon: LineChart, key: 'nav.marketInsights' },
      { id: 'price-history', label: 'Price History', href: '/app/price-history', icon: History, key: 'nav.priceHistory' },
      { id: 'video-reviews', label: 'Video Reviews', href: '/app/video-reviews', icon: PlaySquare, key: 'nav.videoReviews' },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'notifications', label: 'Notifications', href: '/app/notifications', icon: Bell, key: 'nav.notifications' },
      { id: 'activity', label: 'Activity', href: '/app/activity', icon: Activity, key: 'nav.activity' },
      { id: 'integrations', label: 'Integrations', href: '/app/integrations', icon: Plug, key: 'nav.integrations' },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export function navItemForPath(pathname: string): NavItem {
  const match = ALL_NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
  return match ?? ALL_NAV_ITEMS[0];
}
