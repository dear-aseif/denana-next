'use client';

/*
 * CampaignAgendaCard (Phase 16J-Rev1B)
 * Dominant left card of the realigned Dashboard. Shows the ACTIVE campaign's
 * content rows (its content schedule) as a dense, readable agenda sorted by
 * content date. This is a campaign content agenda, NOT a Work Calendar view —
 * rows that are not yet scheduled to the Work Calendar still appear as planned
 * campaign content.
 *
 * - Header: small icon + active campaign name + a Switch affordance (caret)
 *   when more than one campaign exists. No new date-navigation logic is added.
 * - Status tabs: DISPLAY-ONLY counts for the five canonical statuses
 *   (Planning, Scheduled, In Production, Ready to Post, Posted). No filtering.
 * - Agenda list: date + weekday + pillar chip + topic (+ optional hook) +
 *   status badge per row, with row dividers.
 * - Footer: a "View all" text link routing to the Content Planner.
 *
 * Purely presentational: it receives already-loaded rows/counts as props and
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

const STATUS_TABS: Array<{
  key: string;
  label: string;
  tone: string;
  pick: (c: AgendaCounts) => number;
}> = [
  { key: 'planning', label: 'Planning', tone: 'planning', pick: (c) => c.planning },
  { key: 'scheduled', label: 'Scheduled', tone: 'scheduled', pick: (c) => c.scheduled },
  { key: 'production', label: 'In Production', tone: 'production', pick: (c) => c.inProduction },
  { key: 'ready', label: 'Ready to Post', tone: 'ready', pick: (c) => c.readyToPost },
  { key: 'posted', label: 'Posted', tone: 'posted', pick: (c) => c.posted },
];

export default function CampaignAgendaCard({
  campaign,
  rows,
  counts,
  canSwitch,
  onSwitch,
  viewAllHref = '/content-calendar',
}: {
  campaign: Campaign | null;
  rows: ContentRow[];
  counts: AgendaCounts;
  canSwitch: boolean;
  onSwitch: () => void;
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
    <section className="db-agenda">
      <header className="db-agenda-head">
        <div className="db-agenda-titlewrap">
          <span className="db-agenda-icon" aria-hidden="true">🗂️</span>
          <h2 className="db-agenda-title">{campaignName}</h2>
        </div>
        {canSwitch ? (
          <button type="button" className="db-agenda-switch" onClick={onSwitch}>
            Switch <span className="db-caret" aria-hidden="true">▾</span>
          </button>
        ) : null}
      </header>

      <div className="db-agenda-tabs" role="list" aria-label="Content status counts">
        {STATUS_TABS.map((t) => (
          <span key={t.key} className={'db-tab tone-' + t.tone} role="listitem">
            <span className="db-tab-label">{t.label}</span>
            <span className="db-tab-count">{t.pick(counts)}</span>
          </span>
        ))}
      </div>

      {hasRows ? (
        <ul className="db-agenda-list">
          {sorted.map((row) => (
            <li key={row.id} className="db-agenda-row">
              <div className="db-agenda-date">
                <span className="db-agenda-date-main">{fmtDate(row.date) || row.date}</span>
                <span className="db-agenda-date-day">{row.day}</span>
              </div>
              <div className="db-agenda-body">
                <div className="db-agenda-body-top">
                  {row.pillar ? <span className="db-pillar-chip">{row.pillar}</span> : null}
                  <span className="db-agenda-topic">{row.topicTitle || 'Untitled content'}</span>
                </div>
                {row.hook ? <p className="db-agenda-hook">{row.hook}</p> : null}
              </div>
              <span
                className={'status-badge status-badge-' + getContentStatusTone(row.productionStatus)}
              >
                {getContentStatusLabel(row.productionStatus)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="db-agenda-empty">
          <p className="db-agenda-empty-title">No campaign content yet</p>
          <p className="db-agenda-empty-text">
            Create a content plan to see your campaign agenda here.
          </p>
          <Link className="db-link" href="/content-calendar">
            Create content plan &rarr;
          </Link>
        </div>
      )}

      <footer className="db-agenda-foot">
        <Link className="db-link" href={viewAllHref}>
          View all &rarr;
        </Link>
      </footer>
    </section>
  );
}
