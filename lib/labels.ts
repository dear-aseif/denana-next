/*
 * Display-label helpers (Phase 16A).
 * Maps internal Indonesian data values to English UI labels WITHOUT changing
 * the stored data model or the generator. Storage + generation still use the
 * original ProductionStatus values ('Ide' | 'Direncanakan' | 'Sedang Dibuat' |
 * 'Sudah Diposting'); these helpers only affect what the UI renders.
 */
import type { ProductionStatus } from '@/types/content';

export const PRODUCTION_STATUS_LABEL: Record<string, string> = {
  Ide: 'Idea',
  Direncanakan: 'Planning',
  'Sedang Dibuat': 'In Production',
  'Sudah Diposting': 'Posted',
};

export function productionStatusLabel(status: ProductionStatus | string): string {
  return PRODUCTION_STATUS_LABEL[status] ?? String(status);
}

/** Tone bucket for a status pill, reused by StatusBadge. */
export function productionStatusTone(
  status: ProductionStatus | string,
): 'idea' | 'planning' | 'production' | 'posted' {
  switch (status) {
    case 'Sudah Diposting':
      return 'posted';
    case 'Sedang Dibuat':
      return 'production';
    case 'Direncanakan':
      return 'planning';
    default:
      return 'idea';
  }
}
