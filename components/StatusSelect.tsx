'use client';

/*
 * StatusSelect (Phase 16E)
 * Small reusable <select> for the five-status content workflow
 * (Planning -> Scheduled -> In Production -> Ready to Post -> Posted).
 * The current value is normalized first so legacy data still maps cleanly.
 * Presentational: it reports the chosen ContentStatus back to the parent,
 * which owns the storage write (updateContentStatus).
 */
import React from 'react';
import type { ContentStatus } from '@/types/content';
import { CONTENT_STATUSES, normalizeContentStatus } from '@/lib/labels';

export default function StatusSelect({
  value,
  onChange,
  className,
}: {
  value: ContentStatus | string;
  onChange: (next: ContentStatus) => void;
  className?: string;
}) {
  const current = normalizeContentStatus(value);
  return (
    <select
      className={'cell-select' + (className ? ' ' + className : '')}
      value={current}
      onChange={(e) => onChange(e.target.value as ContentStatus)}
      aria-label="Task status"
    >
      {CONTENT_STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
