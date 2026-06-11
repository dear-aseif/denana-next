import React from 'react';

/*
 * DashboardStatGrid (Phase 16J-Rev1B)
 * Progress Content rendered as STAT TILES (not a dot-list). Renders two hero
 * tiles (Active Campaign count + Total Content count) followed by one tile per
 * canonical status (Planning, Scheduled, In Production, Ready to Post, Posted).
 * All five statuses are shown; the workflow/count logic is unchanged — values
 * are passed in as props.
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
  campaignCount,
  stats,
}: {
  total: number;
  campaignCount: number;
  stats: DashboardStat[];
}) {
  return (
    <div className="db-progress">
      <div className="db-hero-row">
        <div className="db-hero-tile">
          <span className="db-hero-num">{campaignCount}</span>
          <span className="db-hero-label">Active Campaign{campaignCount === 1 ? '' : 's'}</span>
        </div>
        <div className="db-hero-tile">
          <span className="db-hero-num">{total}</span>
          <span className="db-hero-label">Total Content</span>
        </div>
      </div>
      <div className="db-stat-grid">
        {stats.map((s) => (
          <div key={s.key} className={'db-stat-tile tone-' + s.tone}>
            <span className="db-stat-num">{s.value}</span>
            <span className="db-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
