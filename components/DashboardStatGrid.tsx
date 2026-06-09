import React from 'react';

/*
 * DashboardStatGrid (Phase 16C)
 * Compact content-progress summary for the dashboard. Renders the total count
 * plus one readable line per canonical status (Planning, Scheduled, In
 * Production, Ready to Post, Posted) with a tone-colored dot. Stays compact so
 * it fits inside a half-width command-center panel on desktop.
 */
export interface DashboardStat {
  key: string;
  label: string;
  value: number;
  /** Status tone from getContentStatusTone(): planning | scheduled | production | ready | posted. */
  tone: string;
}

export default function DashboardStatGrid({
  total,
  stats,
}: {
  total: number;
  stats: DashboardStat[];
}) {
  return (
    <div className="cc-progress">
      <div className="cc-total">
        <span className="cc-total-num">{total}</span>
        <span className="cc-total-label">total content</span>
      </div>
      <ul className="cc-progress-list">
        {stats.map((s) => (
          <li key={s.key} className="cc-progress-row">
            <span className={'cc-progress-dot tone-' + s.tone} />
            <span className="cc-progress-label">{s.label}</span>
            <span className="cc-progress-num">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
