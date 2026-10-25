'use client';

/* Integrations (plan §36): every card honestly labeled "Not yet connected",
   with a Request-integration modal explaining the production requirement. */
import * as React from 'react';
import { Plug, PlugZap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { OrbitBadge } from '@/components/ui/badges';
import { Modal } from '@/components/ui/modal';
import { cn } from '@/lib/easyui/utils';

interface Integration {
  name: string;
  kind: 'source' | 'workflow';
  description: string;
}

const SOURCES: Integration[] = [
  { name: 'Amazon', kind: 'source', description: 'Product listings, Warehouse deals and price movement.' },
  { name: 'eBay', kind: 'source', description: 'Auctions and fixed-price listings across all categories.' },
  { name: 'Zillow', kind: 'source', description: 'US real-estate listings and price cuts.' },
  { name: 'ImmobilienScout24', kind: 'source', description: 'German residential listings, expose-level detail.' },
  { name: 'Chrono24', kind: 'source', description: 'Watch listings with reference-price bands.' },
  { name: 'Kleinanzeigen', kind: 'source', description: 'German classifieds — rare parts and private sales.' },
  { name: 'Bring a Trailer', kind: 'source', description: 'Collector-car auctions and results.' },
];

const WORKFLOWS: Integration[] = [
  { name: 'Slack', kind: 'workflow', description: 'Push match alerts into channels.' },
  { name: 'Notion', kind: 'workflow', description: 'Sync shortlisted opportunities into databases.' },
  { name: 'Google Sheets', kind: 'workflow', description: 'Export opportunity pipelines for analysis.' },
  { name: 'Zapier', kind: 'workflow', description: 'Connect ORBIT events to 6,000+ apps.' },
];

export function IntegrationsGrid() {
  const [requested, setRequested] = React.useState<Integration | null>(null);
  const [requestedNames, setRequestedNames] = React.useState<string[]>([]);

  const card = (integration: Integration) => {
    const isRequested = requestedNames.includes(integration.name);
    return (
      <Card key={integration.name} className="h-full">
        <CardContent className="flex h-full flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-lg bg-[var(--color-surface-subtle)] text-[var(--text-secondary)]">
                {integration.kind === 'source' ? <Plug className="size-4" strokeWidth={1.75} aria-hidden /> : <PlugZap className="size-4" strokeWidth={1.75} aria-hidden />}
              </span>
              <div>
                <p className="text-[13px] font-semibold text-[var(--text-primary)]">{integration.name}</p>
                <p className="text-[11px] capitalize text-[var(--text-muted)]">{integration.kind === 'source' ? 'Marketplace source' : 'Workflow'}</p>
              </div>
            </div>
            <OrbitBadge tone="neutral">Not yet connected</OrbitBadge>
          </div>
          <p className="flex-1 text-xs leading-relaxed text-[var(--text-secondary)]">{integration.description}</p>
          <button
            type="button"
            onClick={() => setRequested(integration)}
            disabled={isRequested}
            className={cn(
              'focus-ring inline-flex h-9 w-full items-center justify-center rounded-lg border text-[13px] font-medium transition-colors',
              isRequested
                ? 'cursor-default border-[var(--border)] bg-[var(--color-surface-subtle)] text-[var(--text-muted)]'
                : 'border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
            )}
          >
            {isRequested ? 'Request submitted' : 'Request integration'}
          </button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--text-primary)]">Integrations</h1>
        <p className="mt-1 text-sm text-[var(--text-muted)]">
          The marketplaces and workflows ORBIT will connect to. No integration is live in this build — the production
          crawler activates them.
        </p>
      </div>

      <section aria-labelledby="sources-heading">
        <h2 id="sources-heading" className="mb-3 text-sm font-semibold uppercase tracking-[0.02em] text-[var(--text-muted)]">
          Marketplace sources
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{SOURCES.map(card)}</div>
      </section>

      <section aria-labelledby="workflows-heading">
        <h2 id="workflows-heading" className="mb-3 text-sm font-semibold uppercase tracking-[0.02em] text-[var(--text-muted)]">
          Workflows & notifications
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">{WORKFLOWS.map(card)}</div>
      </section>

      <Modal
        open={requested !== null}
        onClose={() => setRequested(null)}
        title={requested ? `Request ${requested.name} integration` : ''}
        description={requested ? `You're asking for ${requested.name} to be prioritized in the connector pipeline.` : undefined}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRequested(null)}
              className="focus-ring h-9 rounded-lg border border-[var(--border)] px-3.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                if (requested) setRequestedNames((n) => [...n, requested.name]);
                setRequested(null);
              }}
              className="focus-ring h-9 rounded-lg bg-[var(--accent)] px-3.5 text-sm font-medium text-white hover:opacity-90"
            >
              Submit request
            </button>
          </>
        }
      >
        <p className="text-[13px] leading-relaxed text-[var(--text-secondary)]">
          Connectors require the production crawling backend, which goes live after launch. Your request tells us
          which sources to build first — we&apos;ll notify you when it ships.
        </p>
      </Modal>
    </div>
  );
}
