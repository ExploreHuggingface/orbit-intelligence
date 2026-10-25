import { describe, expect, it } from 'vitest';
import {
  dealScoreTone,
  formatDate,
  formatMoney,
  formatNumber,
  formatPercent,
  formatRelative,
  initialsOf,
  truncate,
} from '@/lib/utils/format';

describe('formatMoney', () => {
  it('formats EUR without cents by default', () => {
    expect(formatMoney(329000)).toBe('€329,000');
  });

  it('compacts thousands and millions', () => {
    expect(formatMoney(366000, { compact: true })).toBe('€366k');
    expect(formatMoney(1200000, { compact: true })).toBe('€1.2M');
    expect(formatMoney(9800, { compact: true })).toBe('€9.8k');
  });

  it('supports withCents', () => {
    expect(formatMoney(3850.5, { withCents: true })).toBe('€3,850.50');
  });
});

describe('formatRelative', () => {
  it('renders recent times', () => {
    const now = Date.now();
    expect(formatRelative(new Date(now - 30_000).toISOString())).toBe('just now');
    expect(formatRelative(new Date(now - 5 * 60_000).toISOString())).toBe('5 min ago');
    expect(formatRelative(new Date(now - 3 * 3_600_000).toISOString())).toBe('3 h ago');
    expect(formatRelative(new Date(now - 2 * 86_400_000).toISOString())).toBe('2 d ago');
  });
});

describe('dealScoreTone', () => {
  it('maps score bands to semantic tones', () => {
    expect(dealScoreTone(90)).toBe('positive');
    expect(dealScoreTone(85)).toBe('positive');
    expect(dealScoreTone(71)).toBe('info');
    expect(dealScoreTone(42)).toBe('warning');
  });
});

describe('misc formatters', () => {
  it('formatPercent adds sign only when requested', () => {
    expect(formatPercent(7.24)).toBe('7.2%');
    expect(formatPercent(7.24, { sign: true })).toBe('+7.2%');
    expect(formatPercent(-7.24)).toBe('-7.2%');
  });

  it('formatNumber uses locale grouping', () => {
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formatDate renders short dates', () => {
    expect(formatDate('2026-10-25T00:00:00Z')).toMatch(/25 Oct 2026|Oct 25, 2026/);
  });

  it('initialsOf takes first two words', () => {
    expect(initialsOf('Demo Operator')).toBe('DO');
    expect(initialsOf('single')).toBe('S');
    expect(initialsOf('')).toBe('');
  });

  it('truncate appends ellipsis', () => {
    expect(truncate('abcdefghij', 5)).toBe('abcd…');
    expect(truncate('abc', 5)).toBe('abc');
  });
});
