/*
 * storage.ts
 * Thin wrapper around localStorage for Phase 1 persistence.
 * No backend / no database — everything lives in the browser, exactly like
 * the original prototype. All functions are SSR-safe (guard `window`).
 *
 * Future phases can swap these implementations for an API/database layer
 * without changing the calling components.
 */
import { STORAGE_KEYS } from '@/data/sampleContent';
import type {
  BrandSnapshot,
  Campaign,
  ContentRow,
  ContentDraft,
  DraftMap,
  SeriesBible,
} from '@/types/content';

function isBrowser(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function load<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const v = window.localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, val: T): boolean {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(val));
    return true;
  } catch {
    return false;
  }
}

/* ---------- Brand / Campaign / Calendar ---------- */
export function getBrand(): BrandSnapshot | null {
  return load<BrandSnapshot | null>(STORAGE_KEYS.brandSnapshot, null);
}
export function saveBrand(data: BrandSnapshot): boolean {
  return save(STORAGE_KEYS.brandSnapshot, data);
}

export function getCampaign(): Campaign | null {
  return load<Campaign | null>(STORAGE_KEYS.campaign, null);
}
export function saveCampaign(data: Campaign): boolean {
  return save(STORAGE_KEYS.campaign, data);
}

export function getCalendar(): ContentRow[] {
  return load<ContentRow[]>(STORAGE_KEYS.contentCalendar, []);
}
export function saveCalendar(rows: ContentRow[]): boolean {
  return save(STORAGE_KEYS.contentCalendar, rows);
}

/* ---------- Series Bible (Module 1.1) ---------- */
export function getSeriesBible(): SeriesBible | null {
  return load<SeriesBible | null>(STORAGE_KEYS.seriesBible, null);
}
export function saveSeriesBible(data: SeriesBible): boolean {
  return save(STORAGE_KEYS.seriesBible, data);
}

/* ---------- Drafts ---------- */
export function getDrafts(): DraftMap {
  return load<DraftMap>(STORAGE_KEYS.contentDrafts, {}) || {};
}
export function getDraft(id: string): ContentDraft | null {
  const s = getDrafts();
  return s[id] || null;
}
export function hasDraft(id: string): boolean {
  return !!getDraft(id);
}
export function putDraft(id: string, draft: ContentDraft): void {
  const s = getDrafts();
  s[id] = draft;
  save(STORAGE_KEYS.contentDrafts, s);
}
export function draftCount(): number {
  return Object.keys(getDrafts()).length;
}

/** Reset all local prototype data (used by the error-recovery card). */
export function resetAllLocalData(): void {
  if (!isBrowser()) return;
  [
    STORAGE_KEYS.brandSnapshot,
    STORAGE_KEYS.campaign,
    STORAGE_KEYS.contentCalendar,
    STORAGE_KEYS.contentDrafts,
    STORAGE_KEYS.seriesBible,
  ].forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}
