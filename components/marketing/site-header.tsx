'use client';

/* Marketing header (plan §16): sticky, blur, dropdowns, mobile sheet,
   border after 8px scroll. */
import * as React from 'react';
import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { OrbitMark } from '@/components/ui/logo';
import { cn } from '@/lib/easyui/utils';

interface NavLink {
  label: string;
  href: string;
  children?: Array<{ label: string; href: string; description?: string }>;
}

const NAV: NavLink[] = [
  {
    label: 'Product',
    href: '/features',
    children: [
      { label: 'Features overview', href: '/features', description: 'Everything ORBIT does' },
      { label: 'Monitors', href: '/features/monitors', description: 'Watches that never sleep' },
      { label: 'Deal scores', href: '/features/deal-scores', description: 'Every match, priced against reference' },
      { label: 'Alerts', href: '/features/alerts', description: 'Know the moment something appears' },
    ],
  },
  {
    label: 'Use Cases',
    href: '/use-cases',
    children: [
      { label: 'Real Estate', href: '/use-cases/real-estate', description: 'Yield-first property hunting' },
      { label: 'Collectors', href: '/use-cases/collectors', description: 'Watches and rare pieces' },
      { label: 'Deal Hunters', href: '/use-cases/deal-hunting', description: 'Cars, parts, electronics' },
    ],
  },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = React.useState(false);
  const [openMenu, setOpenMenu] = React.useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const headerRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) setOpenMenu(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpenMenu(null); setMobileOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, []);

  React.useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  return (
    <>
      <header
        ref={headerRef}
        className={cn(
          'sticky top-0 z-40 bg-white/80 backdrop-blur-md transition-colors',
          scrolled ? 'border-b border-[var(--color-line)]' : 'border-b border-transparent'
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <Link href="/" className="focus-ring flex items-center gap-2.5 rounded" aria-label="ORBIT Intelligence home">
            <OrbitMark size={24} />
            <span className="text-[15px] font-semibold tracking-[-0.01em] text-[var(--color-ink)]">
              ORBIT<span className="ml-1.5 font-normal text-[var(--color-ink-secondary)]">Intelligence</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((item) => (
              <div key={item.label} className="relative">
                {item.children ? (
                  <button
                    type="button"
                    aria-expanded={openMenu === item.label}
                    aria-haspopup="menu"
                    onClick={() => setOpenMenu((m) => (m === item.label ? null : item.label))}
                    onMouseEnter={() => setOpenMenu(item.label)}
                    className={cn(
                      'focus-ring inline-flex h-9 items-center gap-1 rounded-lg px-3 text-[14px] font-medium',
                      openMenu === item.label ? 'text-[var(--color-ink)]' : 'text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]'
                    )}
                  >
                    {item.label}
                    <ChevronDown className={cn('size-3.5 transition-transform', openMenu === item.label && 'rotate-180')} aria-hidden />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className="focus-ring inline-flex h-9 items-center rounded-lg px-3 text-[14px] font-medium text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]"
                  >
                    {item.label}
                  </Link>
                )}
                {item.children && openMenu === item.label && (
                  <div
                    role="menu"
                    aria-label={item.label}
                    className="absolute left-0 top-full z-50 mt-1 w-64 rounded-xl border border-[var(--color-line)] bg-white p-1.5 shadow-[var(--shadow-lg)]"
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        role="menuitem"
                        onClick={() => setOpenMenu(null)}
                        className="focus-ring block rounded-lg px-3 py-2.5 hover:bg-[var(--color-canvas)]"
                      >
                        <span className="block text-[14px] font-medium text-[var(--color-ink)]">{child.label}</span>
                        {child.description && (
                          <span className="block text-[12px] text-[var(--color-ink-tertiary)]">{child.description}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              href="/login"
              className="focus-ring inline-flex h-9 items-center rounded-lg px-3 text-[14px] font-medium text-[var(--color-ink-secondary)] hover:text-[var(--color-ink)]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="focus-ring inline-flex h-9 items-center rounded-lg bg-[var(--color-ink)] px-4 text-[14px] font-medium text-white hover:opacity-90"
            >
              Start free
            </Link>
          </div>

          <button
            type="button"
            className="focus-ring grid size-10 place-items-center rounded-lg text-[var(--color-ink)] md:hidden"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {/* Mobile full-screen sheet */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white md:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="flex h-16 items-center justify-between px-6">
            <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2.5" aria-label="ORBIT Intelligence home">
              <OrbitMark size={24} />
              <span className="text-[15px] font-semibold">ORBIT</span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="focus-ring grid size-10 place-items-center rounded-lg"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-4" aria-label="Mobile">
            {NAV.map((item) => (
              <div key={item.label} className="border-b border-[var(--color-line)] py-3">
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring block rounded text-[16px] font-semibold text-[var(--color-ink)]"
                >
                  {item.label}
                </Link>
                {item.children && (
                  <div className="mt-2 space-y-1.5 pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={() => setMobileOpen(false)}
                        className="focus-ring block rounded text-[14px] text-[var(--color-ink-secondary)]"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
          <div className="flex flex-col gap-2 border-t border-[var(--color-line)] p-6">
            <Link
              href="/signup"
              onClick={() => setMobileOpen(false)}
              className="focus-ring inline-flex h-11 items-center justify-center rounded-lg bg-[var(--color-ink)] text-[15px] font-medium text-white"
            >
              Start free
            </Link>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="focus-ring inline-flex h-11 items-center justify-center rounded-lg border border-[var(--color-line)] text-[15px] font-medium text-[var(--color-ink-secondary)]"
            >
              Sign in
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
