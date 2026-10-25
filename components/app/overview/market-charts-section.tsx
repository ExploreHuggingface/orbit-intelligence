'use client';

/* Range selector wrapper — pushes ?range= param, server re-queries. */
import { useRouter, useSearchParams } from 'next/navigation';
import { MarketCharts } from './market-charts';
import type {
  CategoryPriceDrop,
  DealScoreDistribution,
  DiscoveriesPoint,
  MarketVsListing,
} from '@/lib/types';

export function MarketChartsSection({
  rangeDays,
  discoveries,
  priceDrops,
  scoreDistribution,
  avgDealScore,
  marketVsListing,
}: {
  rangeDays: number;
  discoveries: DiscoveriesPoint[];
  priceDrops: CategoryPriceDrop[];
  scoreDistribution: DealScoreDistribution[];
  avgDealScore: number;
  marketVsListing: MarketVsListing[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <MarketCharts
      rangeDays={rangeDays}
      discoveries={discoveries}
      priceDrops={priceDrops}
      scoreDistribution={scoreDistribution}
      avgDealScore={avgDealScore}
      marketVsListing={marketVsListing}
      onRangeChange={(days) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('range', String(days));
        router.push(`/app/overview?${params.toString()}`, { scroll: false });
      }}
    />
  );
}
