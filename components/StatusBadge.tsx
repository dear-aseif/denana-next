/*
 * StatusBadge (Phase 16A primitive, extended in Phase 16B)
 * Reusable status pill that renders the English label + tone for a content
 * status. Supports all five canonical statuses (Planning, Scheduled, In
 * Production, Ready to Post, Posted) and safely normalizes legacy values.
 */
import React from 'react';
import type { ContentStatus, ProductionStatus } from '@/types/content';
import { getContentStatusLabel, getContentStatusTone } from '@/lib/labels';

export default function StatusBadge({
  status,
}: {
  status: ContentStatus | ProductionStatus | string;
}) {
  return (
    <span className={'status-badge status-badge-' + getContentStatusTone(status)}>
      {getContentStatusLabel(status)}
    </span>
  );
}
