'use client';

import React from 'react';
import type { WorkItem } from '@/lib/storage';
import Card from './Card';
import Button from './Button';
import WorkItemList from './WorkItemList';
import EmptyState from './EmptyState';

/*
 * TodayWorkCard (Phase 16C)
 * Command-center panel that surfaces Work Calendar helper data on the dashboard.
 * - Prefers today's work (getTodayWorkItems); falls back to upcoming work
 *   (getUpcomingWorkItems) when nothing is scheduled for today.
 * - Shows the first `max` (default 5) items.
 * - Keeps a visual "View Work Calendar" CTA, disabled until the Work Calendar
 *   route ships in a later phase.
 * - Shows a friendly empty state when there is no scheduled work at all.
 * Purely presentational: it receives already-loaded items as props.
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
    <Card className="cc-work">
      <div className="cc-work-head">
        <div className="cc-work-head-text">
          <h3 className="cc-work-title">{title}</h3>
          {hasAny && (
            <span className="cc-work-count">
              {showToday ? 'Scheduled for today' : 'Next up'} &middot; {source.length} item{source.length === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <Button variant="secondary" size="small" disabled title="Work Calendar is coming soon">
          View Work Calendar
        </Button>
      </div>

      {hasAny ? (
        <WorkItemList items={items} />
      ) : (
        <EmptyState
          big="🗂️"
          title="No work scheduled yet"
          action={
            <Button href="/content-calendar" variant="secondary" size="small">
              Go to Content Planner &rarr;
            </Button>
          }
        >
          Move content from Content Planner to Work Calendar to start assigning daily tasks.
        </EmptyState>
      )}
    </Card>
  );
}
