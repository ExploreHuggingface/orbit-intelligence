/* Currency, date, score, and misc formatting helpers. */

export function formatMoney(value: number, opts?: { compact?: boolean; currency?: string; withCents?: boolean }): string {
  const currency = opts?.currency ?? 'EUR';
  if (opts?.compact && Math.abs(value) >= 1000) {
    const k = value / 1000;
    const m = value / 1_000_000;
    const symbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '';
    if (Math.abs(m) >= 1) return `${symbol}${m.toFixed(1).replace(/\.0$/, '')}M`;
    return `${symbol}${k >= 100 ? Math.round(k) : k.toFixed(1).replace(/\.0$/, '')}k`;
  }
  return new Intl.NumberFormat('en-IE', {
    style: 'currency',
    currency,
    maximumFractionDigits: opts?.withCents ? 2 : 0,
  }).format(value);
}

export function formatPercent(value: number, opts?: { sign?: boolean }): string {
  const sign = opts?.sign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-IE').format(value);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IE', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Relative time: "just now", "4 min ago", "3 h ago", "2 d ago". */
export function formatRelative(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} d ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months} mo ago`;
  return `${Math.round(months / 12)} y ago`;
}

/** Deal score → semantic color token name. */
export function dealScoreTone(score: number): 'positive' | 'info' | 'warning' {
  if (score >= 85) return 'positive';
  if (score >= 70) return 'info';
  return 'warning';
}

export function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');
}

export function truncate(s: string, max: number): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}
