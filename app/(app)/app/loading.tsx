import { Card, CardContent } from '@/components/ui/card';

export default function AppLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading">
      <div className="space-y-2">
        <div className="h-7 w-80 animate-pulse rounded-lg bg-[var(--surface-raised)]" />
        <div className="h-4 w-64 animate-pulse rounded-lg bg-[var(--surface-raised)]" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="space-y-3 py-5">
              <div className="h-3 w-24 animate-pulse rounded bg-[var(--surface-raised)]" />
              <div className="h-7 w-16 animate-pulse rounded bg-[var(--surface-raised)]" />
              <div className="h-8 w-full animate-pulse rounded bg-[var(--surface-raised)]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="space-y-3 py-6">
          <div className="h-4 w-48 animate-pulse rounded bg-[var(--surface-raised)]" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-full animate-pulse rounded bg-[var(--surface-raised)]" />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
