'use client';

/*
 * PlannerActionGroup (Phase 16F)
 * A clean, compact action stack for one Content Planner row.
 *   - Primary:   Open Detail (the only gold button in the cell)
 *   - Secondary: Assign / Edit Schedule (label depends on scheduledDate)
 *   - Secondary: Copy
 * Keeps every existing row action available but avoids stacking multiple
 * gold buttons. Presentational only — all handlers live in the parent.
 */
import React from 'react';
import type { ContentRow } from '@/types/content';
import Button from './Button';

export default function PlannerActionGroup({
  row,
  onDetail,
  onAssign,
  onCopy,
}: {
  row: ContentRow;
  onDetail: (id: string) => void;
  onAssign: (id: string) => void;
  onCopy: (id: string) => void;
}) {
  const scheduled = !!row.scheduledDate;
  return (
    <div className="row-actions planner-actions">
      <Button size="small" onClick={() => onDetail(row.id)}>
        Open Detail
      </Button>
      <Button variant="secondary" size="tiny" onClick={() => onAssign(row.id)}>
        {scheduled ? 'Edit Schedule' : 'Assign'}
      </Button>
      <Button variant="ghost" size="tiny" onClick={() => onCopy(row.id)}>
        Copy
      </Button>
    </div>
  );
}
