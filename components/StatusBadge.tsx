/*
 * StatusBadge (Phase 16A primitive)
 * Reusable status pill that renders the English label for a production status.
 * Ready for use on the Content Planner / My Campaign tables in Phase 16B.
 */
import React from 'react';
import type { ProductionStatus } from '@/types/content';
import { productionStatusLabel, productionStatusTone } from '@/lib/labels';

export default function StatusBadge({ status }: { status: ProductionStatus | string }) {
  return (
    <span className={'status-badge status-badge-' + productionStatusTone(status)}>
      {productionStatusLabel(status)}
    </span>
  );
}
