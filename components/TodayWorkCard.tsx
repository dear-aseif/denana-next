'use client';

import React from 'react';
import Link from 'next/link';
import type { WorkItem } from '@/lib/storage';
import Card from './Card';
import WorkItemList from './WorkItemList';

/*
 * TodayWorkCard (Phase 16J-Rev2 — neutral)
 * Compact right-rail card. Prefers today's work (getTodayWorkItems); falls back
 * to upcoming work (getUpcomingWorkItems) when nothing is scheduled for today.
 * Shows the first `max` (default 5) items as compact rows, plus a small,
 * non-dashed empty state when there is no scheduled work. Neutral styling, with
 * a plain text link to the Work Calendar. Purely presentational.
 */
function CalendarIcon() {
  return (
    <svg className="hn-ic" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function TodayWorkCard({
  today,
  upcoming,
  max = 5,
}: {
  today: WorkItem[];
  upcoming: WorkItem[];
  max?: number;
}) {
  const showToday = today.length > 0;
  const source = showToday ? today : upcoming;
  const items = source.slice(0, max);
  const hasAny = items.length > 0;
  const title = showToday ? "Today's Work" : 'Upcoming Work';

  return (
    <Card className="hn-card hn-today-card">
      <div className="hn-card-head">
        <span className="hn-card-title"><CalendarIcon /> {title}</span>
        <Link className="hn-link" href="/work-calendar">Work Calendar &rarr;</Link>
      </div>

      {hasAny ? (
        <WorkItemList items={items} />
      ) : (
        <div className="hn-today-empty">
          <p className="hn-today-empty-title">No work scheduled yet</p>
          <p className="hn-today-empty-text">
            Assign content from Content Planner to start planning daily work.
          </p>
          <Link className="hn-link" href="/content-calendar">Go to Content Planner &rarr;</Link>
        </div>
      )}
    </Card>
  );
}
