'use client';

/*
 * ContentTopicCell (Phase 16F)
 * The Topic / Hook cell of the Content Planner table. Keeps both fields inline
 * editable (existing behavior) but improves hierarchy:
 *   - Topic / title is the primary, more prominent line.
 *   - Hook is secondary, muted + italic.
 *   - A "Draft saved" badge appears when a draft exists.
 * Heights are capped via CSS so long text does not blow out the row.
 */
import React from 'react';
import type { ContentRow } from '@/types/content';

export default function ContentTopicCell({
  row,
  hasDraft,
  onField,
}: {
  row: ContentRow;
  hasDraft: boolean;
  onField: (id: string, key: keyof ContentRow, value: string) => void;
}) {
  return (
    <div className="topic-cell">
      <textarea
        className="cell-input topic-title-input"
        value={row.topicTitle}
        onChange={(e) => onField(row.id, 'topicTitle', e.target.value)}
        aria-label="Topic / title"
      />
      <textarea
        className="cell-input topic-hook-input"
        value={row.hook}
        onChange={(e) => onField(row.id, 'hook', e.target.value)}
        aria-label="Hook"
        placeholder="Hook"
      />
      {hasDraft ? <span className="draft-badge">✓ Draft saved</span> : null}
    </div>
  );
}
