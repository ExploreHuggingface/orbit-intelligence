'use client';

/* Discover filter rail (plan §26): category-adaptive filters synced to URL
   params; collapses to a sheet on mobile. Debounced application is implicit —
   controls push params on change/commit. */
import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES, type Category } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';
import { useI18n } from '@/lib/i18n/context';

export interface Facets {
  cities: string[];
  neighborhoods: string[];
  brands: string[];
  marketplaces: string[];
}

type Params = Record<string, string | null>;

export function FilterPanel({ facets, category }: { facets: Facets; category: Category | 'all' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const { t } = useI18n();

  const setParams = (patch: Params) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v == null || v === '') params.delete(k);
      else params.set(k, v);
    }
    params.delete('page');
    router.push(`/app/discover?${params.toString()}`, { scroll: false });
  };

  const one = (k: string) => searchParams.get(k) ?? '';
  const many = (k: string) => (searchParams.get(k) ?? '').split(',').filter(Boolean);

  const toggleMulti = (key: string, value: string) => {
    const current = many(key);
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setParams({ [key]: next.join(',') || null });
  };

  const activeCount =
    many('city').length +
    many('neighborhoods').length +
    many('brand').length +
    many('marketplaces').length +
    (one('price_min') ? 1 : 0) +
    (one('price_max') ? 1 : 0) +
    (one('property_type') ? 1 : 0) +
    (one('bedrooms_min') ? 1 : 0) +
    (one('yield_min') ? 1 : 0) +
    (one('condition') ? 1 : 0) +
    (searchParams.get('price_drop_only') === '1' ? 1 : 0);

  const isRealEstate = category === 'real_estate';
  const chip = (active: boolean) =>
    cn(
      'focus-ring rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
      active
        ? 'border-transparent bg-[var(--accent)] text-white'
        : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
    );

  const body = (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[var(--text-primary)]">
          <SlidersHorizontal className="size-3.5" aria-hidden /> {t('filter.title')}
          {activeCount > 0 && (
            <span className="tnum rounded-full bg-[color:var(--color-brand-subtle)] px-1.5 text-[11px] text-[color:var(--color-brand)]">
              {activeCount}
            </span>
          )}
        </p>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() =>
              setParams({
                city: null, neighborhoods: null, brand: null, marketplaces: null,
                price_min: null, price_max: null, property_type: null, bedrooms_min: null,
                yield_min: null, ppm2: null, condition: null, price_drop_only: null,
              })
            }
            className="focus-ring rounded text-xs text-[color:var(--color-brand)] hover:underline"
          >
            {t('common.clearAll')}
          </button>
        )}
      </div>

      {/* Price range — all categories */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
          {t('filter.priceRange')}
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            defaultValue={one('price_min')}
            key={`pmin-${one('price_min')}`}
            onBlur={(e) => setParams({ price_min: e.target.value || null })}
            onKeyDown={(e) => e.key === 'Enter' && setParams({ price_min: (e.target as HTMLInputElement).value || null })}
            placeholder={t('filter.min')}
            aria-label="Minimum price"
            className="focus-ring tnum h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px]"
          />
          <span className="text-[var(--text-subtle)]" aria-hidden>–</span>
          <input
            type="number"
            min={0}
            defaultValue={one('price_max')}
            key={`pmax-${one('price_max')}`}
            onBlur={(e) => setParams({ price_max: e.target.value || null })}
            onKeyDown={(e) => e.key === 'Enter' && setParams({ price_max: (e.target as HTMLInputElement).value || null })}
            placeholder={t('filter.max')}
            aria-label="Maximum price"
            className="focus-ring tnum h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px]"
          />
        </div>
      </div>

      {isRealEstate ? (
        <>
          {facets.neighborhoods.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">{t('filter.neighborhood')}</p>
              <div className="flex flex-wrap gap-1.5">
                {facets.neighborhoods.slice(0, 14).map((n) => (
                  <button key={n} type="button" onClick={() => toggleMulti('neighborhoods', n)} aria-pressed={many('neighborhoods').includes(n)} className={chip(many('neighborhoods').includes(n))}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="f-prop" className="block text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
              {t('filter.propertyType')}
            </label>
            <select
              id="f-prop"
              value={one('property_type')}
              onChange={(e) => setParams({ property_type: e.target.value || null })}
              className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px]"
            >
              <option value="">{t('filter.any')}</option>
              <option>Apartment</option>
              <option>Conda</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="f-bed" className="block text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
              {t('filter.bedroomsMin')}
            </label>
            <select
              id="f-bed"
              value={one('bedrooms_min')}
              onChange={(e) => setParams({ bedrooms_min: e.target.value || null })}
              className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px]"
            >
              <option value="">{t('filter.any')}</option>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}+</option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="f-yield" className="flex justify-between text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
              {t('filter.grossYieldMin')} <span className="tnum text-[var(--text-primary)]">{one('yield_min') ? `${one('yield_min')}%` : '—'}</span>
            </label>
            <input
              id="f-yield"
              type="range"
              min={0}
              max={8}
              step={0.5}
              value={one('yield_min') || '0'}
              onChange={(e) => setParams({ yield_min: e.target.value === '0' ? null : e.target.value })}
              className="w-full accent-[var(--accent)]"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="f-ppm2" className="block text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
              {t('filter.pricePerM2Max')}
            </label>
            <input
              id="f-ppm2"
              type="number"
              min={0}
              step={100}
              defaultValue={one('ppm2')}
              key={`ppm2-${one('ppm2')}`}
              onBlur={(e) => setParams({ ppm2: e.target.value || null })}
              placeholder="e.g. 6000"
              className="focus-ring tnum h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px]"
            />
          </div>
        </>
      ) : (
        <>
          {facets.brands.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">{t('filter.brand')}</p>
              <div className="flex max-h-40 flex-wrap gap-1.5 overflow-y-auto">
                {facets.brands.slice(0, 16).map((b) => (
                  <button key={b} type="button" onClick={() => toggleMulti('brand', b)} aria-pressed={many('brand').includes(b)} className={chip(many('brand').includes(b))}>
                    {b}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="f-cond" className="block text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">
              {t('filter.condition')}
            </label>
            <select
              id="f-cond"
              value={one('condition')}
              onChange={(e) => setParams({ condition: e.target.value || null })}
              className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[13px]"
            >
              <option value="">{t('filter.any')}</option>
              <option value="Excellent">Excellent</option>
              <option value="Very good">Very good</option>
              <option value="Grade A">Grade A</option>
              <option value="New old stock">New old stock</option>
              <option value="Open box">Open box</option>
            </select>
          </div>
        </>
      )}

      {facets.marketplaces.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-[0.02em] text-[var(--text-muted)]">{t('filter.marketplace')}</p>
          <div className="flex flex-wrap gap-1.5">
            {facets.marketplaces.slice(0, 10).map((m) => (
              <button key={m} type="button" onClick={() => toggleMulti('marketplaces', m)} aria-pressed={many('marketplaces').includes(m)} className={chip(many('marketplaces').includes(m))}>
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center justify-between rounded-lg border border-[var(--border)] px-3 py-2.5">
        <span className="text-[13px] font-medium text-[var(--text-primary)]">{t('filter.priceDropOnly')}</span>
        <input
          type="checkbox"
          checked={searchParams.get('price_drop_only') === '1'}
          onChange={(e) => setParams({ price_drop_only: e.target.checked ? '1' : null })}
          className="size-4 rounded accent-[var(--accent)]"
        />
      </label>
    </div>
  );

  return (
    <>
      {/* Desktop rail */}
      <aside className="hidden w-[260px] shrink-0 lg:block" aria-label={t('filter.title')}>
        <div className="sticky top-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">{body}</div>
      </aside>

      {/* Mobile trigger + sheet */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring inline-flex h-9 items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-[13px] font-medium text-[var(--text-secondary)]"
        >
          <Filter className="size-3.5" aria-hidden />
          {t('filter.title')}{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
        {open && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filters">
            <div className="absolute inset-0 bg-[color:var(--color-overlay)]" onClick={() => setOpen(false)} aria-hidden />
            <div className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-[var(--border)] bg-[var(--surface)] p-5 pb-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-semibold">{t('filter.title')}</span>
                <button type="button" onClick={() => setOpen(false)} aria-label={t('filter.closeFilters')} className="focus-ring grid size-8 place-items-center rounded-lg border border-[var(--border)]">
                  <X className="size-4" />
                </button>
              </div>
              {body}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="focus-ring mt-5 h-10 w-full rounded-lg bg-[var(--accent)] text-sm font-medium text-white"
              >
                {t('filter.showResults')}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export function CategoryChips({ active }: { active: Category | 'all' }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Category">
      {(['all', ...CATEGORIES] as const).map((c) => (
        <button
          key={c}
          type="button"
          aria-pressed={active === c}
          onClick={() => {
            const params = new URLSearchParams(searchParams.toString());
            if (c === 'all') params.delete('category');
            else params.set('category', c);
            params.delete('page');
            router.push(`/app/discover?${params.toString()}`, { scroll: false });
          }}
          className={cn(
            'focus-ring h-7 rounded-full border px-3 text-xs font-medium transition-colors',
            active === c
              ? 'border-transparent bg-[var(--accent)] text-white'
              : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
          )}
        >
          {t(`category.${c}` as never)}
        </button>
      ))}
    </div>
  );
}
