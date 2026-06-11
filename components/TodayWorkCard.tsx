'use client';

import React from 'react';
import Link from 'next/link';
import type { WorkItem } from '@/lib/storage';
import Card from './Card';
import Button from './Button';
import WorkItemList from './WorkItemList';

/*
 * TodayWorkCard (Phase 16J-Rev1B)
 * Compact right-rail card. Prefers today's work (getTodayWorkItems); falls back
 * to upcoming work (getUpcomingWorkItems) when nothing is scheduled for today.
 * Shows the first `max` (default 5) items as compact rows, and a small (non
 * dashed) empty state when there is no scheduled work at all. Purely
 * presentational — it receives already-loaded items as props.
 */
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
    <Card className="db-rail-card db-today-card">
      <div className="db-card-head">
        <div className="db-card-headtext">
          <span className="db-card-title">🗓️ {title}</span>
          {hasAny ? (
            <span className="db-card-sub">
              {showToday ? 'Scheduled for today' : 'Next up'} &middot; {source.length} item
              {source.length === 1 ? '' : 's'}
            </span>
          ) : null}
        </div>
        <Button href="/work-calendar" variant="secondary" size="small">
          View Work Calendar
        </Button>
      </div>

      {hasAny ? (
        <WorkItemList items={items} />
      ) : (
        <div className="db-today-empty">
          <p className="db-today-empty-title">No work scheduled yet</p>
          <p className="db-today-empty-text">
            Assign content from Content Planner to start planning daily work.
          </p>
          <Link className="db-link" href="/content-calendar">
            Go to Content Planner &rarr;
          </Link>
        </div>
      )}
    </Card>
  );
}
