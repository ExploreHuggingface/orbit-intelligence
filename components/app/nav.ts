/* App navigation config shared by sidebar, topbar breadcrumbs, and mobile drawer. */
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
}

export const NAV_SECTIONS: Array<{ title: string; items: NavItem[] }> = [
  {
    title: 'Workspace',
    items: [
      { id: 'overview', label: 'Overview', href: '/app/overview', icon: LayoutDashboard },
      { id: 'discover', label: 'Discover', href: '/app/discover', icon: Search },
      { id: 'opportunities', label: 'Opportunities', href: '/app/opportunities', icon: Sparkles },
      { id: 'monitors', label: 'Monitors', href: '/app/monitors', icon: Radar },
      { id: 'collections', label: 'Collections', href: '/app/collections', icon: FolderOpen },
      { id: 'comparisons', label: 'Comparisons', href: '/app/comparisons', icon: GitCompareArrows },
    ],
  },
  {
    title: 'Intelligence',
    items: [
      { id: 'market-insights', label: 'Market Insights', href: '/app/market-insights', icon: LineChart },
      { id: 'price-history', label: 'Price History', href: '/app/price-history', icon: History },
      { id: 'video-reviews', label: 'Video Reviews', href: '/app/video-reviews', icon: PlaySquare },
    ],
  },
  {
    title: 'Management',
    items: [
      { id: 'notifications', label: 'Notifications', href: '/app/notifications', icon: Bell },
      { id: 'activity', label: 'Activity', href: '/app/activity', icon: Activity },
      { id: 'integrations', label: 'Integrations', href: '/app/integrations', icon: Plug },
    ],
  },
];

export const ALL_NAV_ITEMS: NavItem[] = NAV_SECTIONS.flatMap((s) => s.items);

export function navItemForPath(pathname: string): NavItem {
  const match = ALL_NAV_ITEMS.find((item) => pathname === item.href || pathname.startsWith(item.href + '/'));
  return match ?? ALL_NAV_ITEMS[0];
}
