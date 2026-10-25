'use client';

/* App sidebar: EasyUI Sidebar wired to Next routing, with ORBIT logo,
   usage meter, settings/help, and the avatar menu (plan §24). */
import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LifeBuoy, LogOut, Settings, UserRound } from 'lucide-react';
import { Sidebar, SidebarTrigger, useSidebar, type SidebarSection } from '@/components/easyui/sidebar';
import { NAV_SECTIONS, navItemForPath } from '@/components/app/nav';
import { UsageMeter } from '@/components/app/shell/usage-meter';
import { useUiStore } from '@/lib/stores/ui-store';
import { useI18n } from '@/lib/i18n/context';
import { initialsOf } from '@/lib/utils/format';
import { signOutAction } from '@/lib/actions/auth';
import { LanguageSelector } from '@/components/ui/language-selector';
import { cn } from '@/lib/easyui/utils';

import { OrbitMark } from '@/components/ui/logo';

function Logo({ collapsed }: { collapsed: boolean }) {
  return (
    <Link href="/app/overview" className="flex items-center gap-2.5 px-2" aria-label="ORBIT Intelligence home">
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-[color:var(--color-brand-subtle)]">
        <OrbitMark size={22} />
      </span>
      {!collapsed && (
        <span className="truncate text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
          ORBIT
          <span className="ml-1.5 font-normal text-[var(--text-muted)]">Intelligence</span>
        </span>
      )}
    </Link>
  );
}

function AvatarMenu({ fullName, email }: { fullName: string; email: string }) {
  const { collapsed } = useSidebar();
  const { t } = useI18n();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (open && ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
        className={cn(
          'focus-ring flex w-full items-center gap-2.5 rounded-lg p-2 text-left hover:bg-[var(--surface-hover)]',
          collapsed && 'justify-center'
        )}
      >
        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[11px] font-semibold text-white">
          {initialsOf(fullName || email)}
        </span>
        {!collapsed && (
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium text-[var(--text-primary)]">{fullName}</span>
            <span className="block truncate text-[11px] text-[var(--text-muted)]">{email}</span>
          </span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="absolute bottom-full left-0 z-40 mb-2 w-52 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-lg)]"
        >
          <Link
            href="/app/settings?tab=profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <UserRound className="size-4" /> {t('nav.account')}
          </Link>
          <Link
            href="/app/settings?tab=workspace"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <Settings className="size-4" /> {t('nav.preferences')}
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => void signOutAction()}
            className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-[13px] text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
          >
            <LogOut className="size-4" /> {t('common.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}

export function AppSidebar({
  unreadCount,
  monitorsUsed,
  monitorsLimit,
  planName,
  fullName,
  email,
}: {
  unreadCount: number;
  monitorsUsed: number;
  monitorsLimit: number;
  planName: string;
  fullName: string;
  email: string;
}) {
  const pathname = usePathname();
  const { t } = useI18n();
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const mobileOpen = useUiStore((s) => s.mobileSidebarOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileSidebarOpen);
  const active = navItemForPath(pathname);

  const sectionTitles: Record<string, string> = {
    Workspace: t('nav.workspace'),
    Intelligence: t('nav.intelligence'),
    Management: t('nav.management'),
  };
  const sections: SidebarSection[] = NAV_SECTIONS.map((section) => ({
    title: sectionTitles[section.title] ?? section.title,
    items: section.items.map((item) => ({
      id: item.id,
      label: t(item.key),
      icon: <item.icon strokeWidth={1.75} />,
      badge:
        item.id === 'notifications' && unreadCount > 0
          ? unreadCount
          : undefined,
    })),
  }));

  const handleNavigate = (id: string) => {
    const item = NAV_SECTIONS.flatMap((s) => s.items).find((i) => i.id === id);
    if (item) window.location.assign(item.href);
  };

  return (
    <Sidebar
      sections={sections}
      activeId={active.id}
      onActiveChange={handleNavigate}
      collapsed={collapsed}
      onCollapsedChange={setCollapsed}
      mobileOpen={mobileOpen}
      onMobileOpenChange={setMobileOpen}
      className="bg-[var(--surface)]"
      header={
        <div className="flex items-center justify-between px-1 pb-1">
          <Logo collapsed={collapsed} />
          {!collapsed && <SidebarTrigger className="hidden md:grid" />}
        </div>
      }
      footer={
        <div className="space-y-2">
          <UsageMeter used={monitorsUsed} limit={monitorsLimit} planName={planName} collapsed={collapsed} />
          <Link
            href="/app/settings"
            aria-label="Settings"
            className={cn(
              'flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]',
              collapsed && 'justify-center px-0'
            )}
          >
            <Settings className="size-[18px]" strokeWidth={1.75} />
            {!collapsed && t('nav.settings')}
          </Link>
          <Link
            href="/contact"
            aria-label="Help — contact us"
            className={cn(
              'flex h-9 items-center gap-3 rounded-lg px-2.5 text-sm text-[var(--text-secondary)] outline-none transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] focus-visible:ring-2 focus-visible:ring-[color:var(--accent-ring)]',
              collapsed && 'justify-center px-0'
            )}
          >
            <LifeBuoy className="size-[18px]" strokeWidth={1.75} />
            {!collapsed && t('nav.help')}
          </Link>
          <AvatarMenu fullName={fullName} email={email} />
          <LanguageSelector />
        </div>
      }
    />
  );
}