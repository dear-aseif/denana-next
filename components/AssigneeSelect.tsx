'use client';

/*
 * AssigneeSelect (Phase 16E)
 * Small reusable <select> for the simulated assignees
 * (Owner / Staff 1 / Staff 2 / Designer). No auth / no real accounts.
 * Presentational: it reports the chosen assignee back to the parent, which
 * owns the storage write (updateContentAssignee).
 */
import React from 'react';
import type { ContentAssignee } from '@/types/content';
import { ASSIGNEES } from '@/data/sampleContent';

export default function AssigneeSelect({
  value,
  onChange,
  className,
}: {
  value: ContentAssignee | string | null | undefined;
  onChange: (next: ContentAssignee) => void;
  className?: string;
}) {
  return (
    <select
      className={'cell-select' + (className ? ' ' + className : '')}
      value={value || 'Owner'}
      onChange={(e) => onChange(e.target.value as ContentAssignee)}
      aria-label="Assignee"
    >
      {ASSIGNEES.map((a) => (
        <option key={a} value={a}>
          {a}
        </option>
      ))}
    </select>
  );
}
