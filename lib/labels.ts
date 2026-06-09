/*
 * Content status label / tone helpers.
 *
 * Phase 16B: the canonical content workflow is now five English statuses:
 *   Planning -> Scheduled -> In Production -> Ready to Post -> Posted
 *
 * Older data (Phase 1 Bahasa Indonesia values, and even-older English values)
 * is migrated into this set on read via normalizeContentStatus(). Unknown
 * values safely fall back to 'Planning' so the UI never crashes.
 *
 * The Phase 16A helpers (productionStatusLabel / productionStatusTone /
 * PRODUCTION_STATUS_LABEL) are kept as thin backward-compatible aliases.
 */
import type { ContentStatus, ProductionStatus } from '@/types/content';

/** Canonical ordered list of the five workflow statuses. */
export const CONTENT_STATUSES: ContentStatus[] = [
  'Planning',
  'Scheduled',
  'In Production',
  'Ready to Post',
  'Posted',
];

/**
 * Maps any historical status string to a canonical ContentStatus.
 * - Ide / Idea / Planned / Direncanakan -> Planning
 * - Sedang Dibuat -> In Production
 * - Sudah Diposting -> Posted
 * - Already-canonical values pass through.
 * - Anything unknown / empty -> Planning.
 */
const STATUS_ALIASES: Record<string, ContentStatus> = {
  // canonical (pass-through)
  Planning: 'Planning',
  Scheduled: 'Scheduled',
  'In Production': 'In Production',
  'Ready to Post': 'Ready to Post',
  Posted: 'Posted',
  // legacy Bahasa Indonesia (Phase 1)
  Ide: 'Planning',
  Direncanakan: 'Planning',
  'Sedang Dibuat': 'In Production',
  'Sudah Diposting': 'Posted',
  // even-older English values
  Idea: 'Planning',
  Planned: 'Planning',
  Ready: 'Ready to Post',
};

export function normalizeContentStatus(status: unknown): ContentStatus {
  if (typeof status === 'string') {
    const hit = STATUS_ALIASES[status.trim()];
    if (hit) return hit;
  }
  return 'Planning';
}

/** English display label for a status (always normalized first). */
export const CONTENT_STATUS_LABEL: Record<ContentStatus, string> = {
  Planning: 'Planning',
  Scheduled: 'Scheduled',
  'In Production': 'In Production',
  'Ready to Post': 'Ready to Post',
  Posted: 'Posted',
};

export function getContentStatusLabel(status: unknown): string {
  return CONTENT_STATUS_LABEL[normalizeContentStatus(status)];
}

/** Tone bucket used to colour a status pill (see .status-badge-* in CSS). */
export type StatusTone = 'planning' | 'scheduled' | 'production' | 'ready' | 'posted';

export function getContentStatusTone(status: unknown): StatusTone {
  switch (normalizeContentStatus(status)) {
    case 'Posted':
      return 'posted';
    case 'Ready to Post':
      return 'ready';
    case 'In Production':
      return 'production';
    case 'Scheduled':
      return 'scheduled';
    default:
      return 'planning';
  }
}

/* ---------- Backward-compatible Phase 16A aliases ---------- */

/** @deprecated Use CONTENT_STATUS_LABEL. */
export const PRODUCTION_STATUS_LABEL = CONTENT_STATUS_LABEL;

/** @deprecated Use getContentStatusLabel. */
export function productionStatusLabel(status: ProductionStatus | string): string {
  return getContentStatusLabel(status);
}

/** @deprecated Use getContentStatusTone. */
export function productionStatusTone(status: ProductionStatus | string): StatusTone {
  return getContentStatusTone(status);
}
