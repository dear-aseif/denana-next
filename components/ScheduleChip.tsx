'use client';

/*
 * ScheduleChip (Phase 16F)
 * Compact, read-only display of a content row's Work Calendar schedule:
 *   📅 <date> · <time?> · <assignee?>
 * When the row is not scheduled it shows a subtle "Not scheduled" hint.
 * Pairs with the Actions column's Assign / Edit Schedule button.
 */
import React from 'react';
import type { ContentRow } from '@/types/content';
import { fmtDate } from '@/lib/utils';

export default function ScheduleChip({ row }: { row: ContentRow }) {
  if (!row.scheduledDate) {
    return <span className="sched-none">Not scheduled</span>;
  }
  return (
    <span className="sched-chip" title="Scheduled on the Work Calendar">
      📅 {fmtDate(row.scheduledDate)}
      {row.scheduledTime ? ' · ' + row.scheduledTime : ''}
      {row.assignee ? ' · ' + row.assignee : ''}
    </span>
  );
}
