'use client';

/* Video Reviews (plan §34): card grid with search + category filter. */
import * as React from 'react';
import Link from 'next/link';
import { ExternalLink, Play, PlaySquare, Search } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { OrbitBadge } from '@/components/ui/badges';
import { CATEGORY_LABELS, CATEGORIES, type Category, type VideoReview } from '@/lib/types';
import { cn } from '@/lib/easyui/utils';

const GRADIENTS: Record<Category, string> = {
  real_estate: 'linear-gradient(135deg, #1D2939, #475467)',
  watches: 'linear-gradient(135deg, #4A1D3F, #EC4899)',
  cars_parts: 'linear-gradient(135deg, #0B3B2E, #12B76A)',
  electronics: 'linear-gradient(135deg, #12275E, #2E90FA)',
  home_living: 'linear-gradient(135deg, #3A2A6B, #7A5AF8)',
};

export function VideoReviewsGrid({ videos }: { videos: VideoReview[] }) {
  const [query, setQuery] = React.useState('');
  const [category, setCategory] = React.useState<Category | 'all'>('all');

  const filtered = videos.filter((v) => {
    if (category !== 'all' && v.category !== category) return false;
    if (query && !v.title.toLowerCase().includes(query.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Video Reviews</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          Curated walkthroughs and buyer guides linked to your categories. External links are illustrative.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--text-subtle)]" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reviews…"
            aria-label="Search video reviews"
            className="focus-ring h-9 w-full rounded-lg border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-[13px] placeholder:text-[var(--text-subtle)]"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Category filter">
          {(['all', ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
              className={cn(
                'focus-ring h-8 rounded-full border px-3 text-xs font-medium transition-colors',
                category === c
                  ? 'border-transparent bg-[var(--accent)] text-white'
                  : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              )}
            >
              {c === 'all' ? 'All' : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={PlaySquare} title="No videos match" description="Try a different search or category." />
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((v) => (
            <li key={v.id}>
              <Card className="h-full transition-shadow hover:shadow-[var(--shadow-sm)]">
                <a
                  href={v.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring block rounded-xl"
                  aria-label={`Watch: ${v.title} (${v.duration}, opens on ${v.source})`}
                >
                  <div
                    className="relative flex aspect-video items-center justify-center rounded-t-xl border-b border-[var(--border-subtle)]"
                    style={{ background: GRADIENTS[v.category] }}
                    aria-hidden
                  >
                    <span className="grid size-11 place-items-center rounded-full bg-white/15 backdrop-blur-sm">
                      <Play className="size-5 fill-white text-white" />
                    </span>
                    <span className="tnum absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[11px] font-medium text-white">
                      {v.duration}
                    </span>
                  </div>
                  <CardContent className="space-y-2 pb-3">
                    <div className="flex items-center justify-between gap-2">
                      <OrbitBadge tone="neutral">{CATEGORY_LABELS[v.category]}</OrbitBadge>
                      <span className="text-[11px] text-[var(--text-muted)]">{v.source}</span>
                    </div>
                    <p className="line-clamp-2 text-[13px] font-medium leading-snug text-[var(--text-primary)]">{v.title}</p>
                  </CardContent>
                </a>
                {v.opportunity_id && (
                  <div className="px-5 pb-4">
                    <Link
                      href={`/app/opportunities?id=${v.opportunity_id}`}
                      className="focus-ring inline-flex items-center gap-1 rounded text-[11px] font-medium text-[color:var(--color-brand)] hover:underline"
                    >
                      Linked opportunity <ExternalLink className="size-3" aria-hidden />
                    </Link>
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}
      <p className="text-[11px] text-[var(--text-muted)]">
        Curated sample content — external links are illustrative and point to public searches on the source platform.
      </p>
    </div>
  );
}
