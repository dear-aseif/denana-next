'use client';

/*
 * WorkDaySummary (Phase 16E)
 * Compact count strip for the selected day: total tasks + a breakdown across
 * the five-status model (Scheduled, In Production, Ready to Post, Posted).
 * Purely presentational — receives the already-filtered day items.
 */
import React from 'react';
import type { WorkItem } from '@/lib/storage';
import { normalizeContentStatus } from '@/lib/labels';
import type { ContentStatus } from '@/types/content';

const CELLS: Array<{ status: ContentStatus; label: string; tone: string }> = [
  { status: 'Scheduled', label: 'Scheduled', tone: 'scheduled' },
  { status: 'In Production', label: 'In Production', tone: 'production' },
  { status: 'Ready to Post', label: 'Ready to Post', tone: 'ready' },
  { status: 'Posted', label: 'Posted', tone: 'posted' },
];

export default function WorkDaySummary({ items }: { items: WorkItem[] }) {
  const counts: Record<ContentStatus, number> = {
    Planning: 0,
    Scheduled: 0,
    'In Production': 0,
    'Ready to Post': 0,
    Posted: 0,
  };
  items.forEach((i) => {
    counts[normalizeContentStatus(i.productionStatus)] += 1;
  });

  return (
    <div className="wc-summary">
      <div className="wc-summary-total">
        <span className="wc-summary-total-num">{items.length}</span>
        <span className="wc-summary-total-label">
          task{items.length === 1 ? '' : 's'} scheduled
        </span>
      </div>
      <div className="wc-summary-cells">
        {CELLS.map((c) => (
          <div className="wc-summary-cell" key={c.status}>
            <span className={'wc-dot wc-dot-' + c.tone} />
            <span className="wc-summary-cell-num">{counts[c.status]}</span>
            <span className="wc-summary-cell-label">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
