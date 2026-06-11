import React from 'react';

/*
 * DashboardStatGrid (Phase 16J-Rev2 — neutral)
 * Progress Content rendered as STAT TILES (not a dot-list). Two prominent hero
 * tiles (Active Campaign count + Total Content count) followed by one tile per
 * canonical status (Planning, Scheduled, In Production, Ready to Post, Posted).
 * Neutral SaaS styling — large numbers, muted labels, soft semantic status
 * dots, no gold. Count logic is unchanged — values come in as props.
 */
export interface DashboardStat {
  key: string;
  label: string;
  value: number;
  /** Status tone: planning | scheduled | production | ready | posted. */
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
    <div className="hn-progress">
      <div className="hn-hero">
        <div className="hn-hero-tile">
          <span className="hn-hero-num">{campaignCount}</span>
          <span className="hn-hero-label">Active Campaign{campaignCount === 1 ? '' : 's'}</span>
        </div>
        <div className="hn-hero-tile">
          <span className="hn-hero-num">{total}</span>
          <span className="hn-hero-label">Total Content</span>
        </div>
      </div>
      <div className="hn-stats">
        {stats.map((s) => (
          <div key={s.key} className={'hn-stat tone-' + s.tone}>
            <span className="hn-stat-num">{s.value}</span>
            <span className="hn-stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
