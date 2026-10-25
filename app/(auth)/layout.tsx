/* Split-screen auth layout (plan §22): form panel left, brand panel right. */
import Link from 'next/link';
import { OrbitMark } from '@/components/ui/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      {/* Form panel */}
      <div className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded" aria-label="ORBIT Intelligence home">
            <OrbitMark size={24} />
            <span className="text-sm font-semibold tracking-[-0.01em] text-[var(--text-primary)]">
              ORBIT<span className="ml-1 font-normal text-[var(--text-muted)]">Intelligence</span>
            </span>
          </Link>
          <Link href="/" className="focus-ring rounded text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">
            ← Back to site
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">{children}</div>
        </div>
        <p className="text-center text-[11px] text-[var(--text-subtle)]">
          © 2026 ORBIT Intelligence · <Link href="/privacy" className="hover:underline">Privacy</Link> ·{' '}
          <Link href="/terms" className="hover:underline">Terms</Link>
        </p>
      </div>

      {/* Brand panel */}
      <div className="relative hidden overflow-hidden bg-[var(--color-ink)] lg:block" aria-hidden>
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(52rem 32rem at 20% 18%, rgba(236,72,153,0.28), transparent 60%), radial-gradient(40rem 28rem at 85% 80%, rgba(46,144,250,0.16), transparent 60%), radial-gradient(30rem 22rem at 60% 40%, rgba(122,90,248,0.12), transparent 60%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2.5">
            <OrbitMark size={28} color="var(--color-brand)" />
            <span className="text-sm font-semibold tracking-[0.02em] text-white/90">ORBIT INTELLIGENCE</span>
          </div>

          {/* Product preview card built from real values */}
          <div className="mx-auto w-full max-w-md space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-white/50">
                  Monitor · Berlin apartments under €350k
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#12B76A26] px-2 py-0.5 text-[11px] font-semibold text-[#5BE49B]">
                  <span className="size-1.5 animate-pulse rounded-full bg-[#5BE49B]" />
                  live
                </span>
              </div>
              <div className="mt-4 space-y-2.5">
                {[
                  ['2-Zimmer-Wohnung, Friedrichshain', '€329,000', 'score 88'],
                  ['Altbau 1-room Neukölln — probate', '€189,000', 'score 85'],
                  ['Condo Prenzlauer Berg, 5.6% yield', '€348,000', 'score 76'],
                ].map(([title, price]) => (
                  <div key={title} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 bg-white/[0.04] px-3.5 py-2.5">
                    <span className="min-w-0 truncate text-[13px] text-white/85">{title}</span>
                    <span className="tnum shrink-0 text-[13px] font-semibold text-white">{price}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] text-white/40">Sample data — illustrative estimates</p>
            </div>
          </div>

          <p className="mx-auto max-w-md text-center text-sm leading-relaxed text-white/60">
            “ORBIT continuously scans marketplaces and the web, scores what matches your criteria,
            and alerts you before the market does.”
          </p>
        </div>
      </div>
    </div>
  );
}
