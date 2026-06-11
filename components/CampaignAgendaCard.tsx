'use client';

/*
 * CampaignAgendaCard (Phase 16J-Rev2 — neutral)
 * Dominant left card of the Homepage. Shows the ACTIVE campaign's content rows
 * (its content schedule) as a dense, readable agenda sorted by content date.
 * This is a campaign content agenda, NOT a Work Calendar view — unscheduled
 * campaign content still appears as planned content.
 *
 * Neutral SaaS styling (no gold). Header: small neutral line icon + active
 * campaign name + a Switch affordance and prev/next campaign arrows (wired to
 * the existing campaign switcher — no new date-navigation logic). Status tabs
 * are DISPLAY-ONLY counts for the five canonical statuses. Footer: a centered
 * "View all" link to the Content Planner.
 *
 * Purely presentational: receives already-loaded rows/counts as props and
 * never mutates data or writes to storage.
 */
import React from 'react';
import Link from 'next/link';
import type { Campaign, ContentRow } from '@/types/content';
import { fmtDate } from '@/lib/utils';
import { getContentStatusLabel, getContentStatusTone } from '@/lib/labels';

export interface AgendaCounts {
  planning: number;
  scheduled: number;
  inProduction: number;
  readyToPost: number;
  posted: number;
}

const STATUS_TABS: Array<{ key: string; label: string; pick: (c: AgendaCounts) => number }> = [
  { key: 'planning', label: 'Planning', pick: (c) => c.planning },
  { key: 'scheduled', label: 'Scheduled', pick: (c) => c.scheduled },
  { key: 'production', label: 'In Production', pick: (c) => c.inProduction },
  { key: 'ready', label: 'Ready to Post', pick: (c) => c.readyToPost },
  { key: 'posted', label: 'Posted', pick: (c) => c.posted },
];

function CalendarIcon() {
  return (
    <svg className="hn-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function CampaignAgendaCard({
  campaign,
  rows,
  counts,
  canSwitch,
  onSwitch,
  onPrev,
  onNext,
  viewAllHref = '/content-calendar',
}: {
  campaign: Campaign | null;
  rows: ContentRow[];
  counts: AgendaCounts;
  canSwitch: boolean;
  onSwitch: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  viewAllHref?: string;
}) {
  // Sort by content date (ISO yyyy-mm-dd sorts lexically). Copy first so we
  // never mutate the caller's array.
  const sorted = [...rows].sort((a, b) => {
    const ad = String(a.date || '');
    const bd = String(b.date || '');
    return ad < bd ? -1 : ad > bd ? 1 : 0;
  });

  const hasRows = sorted.length > 0;
  const campaignName =
    campaign && campaign.campaignName ? campaign.campaignName : 'No active campaign';

  return (
    <section className="hn-agenda">
      <header className="hn-agenda-head">
        <div className="hn-agenda-titlewrap">
          <span className="hn-agenda-icon" aria-hidden="true"><CalendarIcon /></span>
          {canSwitch ? (
            <button type="button" className="hn-agenda-title hn-agenda-title-btn" onClick={onSwitch} title="Switch campaign">
              {campaignName}
              <span className="hn-caret" aria-hidden="true">▾</span>
            </button>
          ) : (
            <h2 className="hn-agenda-title">{campaignName}</h2>
          )}
        </div>
        {canSwitch ? (
          <div className="hn-agenda-nav">
            <button type="button" className="hn-arrow" onClick={onPrev} aria-label="Previous campaign">←</button>
            <button type="button" className="hn-arrow" onClick={onNext} aria-label="Next campaign">→</button>
          </div>
        ) : null}
      </header>

      <div className="hn-tabs" role="list" aria-label="Content status counts">
        {STATUS_TABS.map((t, i) => (
          <span key={t.key} className={'hn-tab' + (i === 0 ? ' is-active' : '')} role="listitem">
            {t.label}
            <span className="hn-tab-count">{t.pick(counts)}</span>
          </span>
        ))}
      </div>

      {hasRows ? (
        <ul className="hn-list">
          {sorted.map((row) => {
            const tone = getContentStatusTone(row.productionStatus);
            return (
              <li key={row.id} className="hn-row">
                <div className="hn-row-date">
                  <span className="hn-row-date-main">{fmtDate(row.date) || row.date}</span>
                  <span className="hn-row-date-day">{row.day}</span>
                </div>
                <div className="hn-row-body">
                  {row.pillar ? <span className="hn-row-pillar">{row.pillar}</span> : null}
                  <span className="hn-row-title">{row.topicTitle || 'Untitled content'}</span>
                  {row.hook ? <p className="hn-row-hook">{row.hook}</p> : null}
                </div>
                <span className={'hn-row-status tone-' + tone} title={getContentStatusLabel(row.productionStatus)}>
                  <span className="hn-row-status-dot" aria-hidden="true" />
                  <span className="hn-row-status-label">{getContentStatusLabel(row.productionStatus)}</span>
                </span>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="hn-empty">
          <p className="hn-empty-title">No campaign content yet</p>
          <p className="hn-empty-text">Create a content plan to see your campaign agenda here.</p>
          <Link className="hn-link" href="/content-calendar">Create content plan &rarr;</Link>
        </div>
      )}

      <footer className="hn-foot">
        <Link className="hn-link" href={viewAllHref}>View all &rarr;</Link>
      </footer>
    </section>
  );
}
