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
  CompetitorEntry,
  KolEntry,
} from '@/types/content';

/* ---------- Batch 2: Indonesian pillar/status normalization ----------
 * Browsers from earlier versions may hold calendars/drafts/brand profiles
 * saved with the old English pillar & status names. We normalize those on
 * read so the UI only ever sees the new Bahasa Indonesia labels and nothing
 * crashes. Unknown / custom values pass through untouched.
 */
const PILLAR_MIGRATION: Record<string, string> = {
  'Facial Education': 'Edukasi Facial',
  'Skin Concern & Solution': 'Masalah & Solusi Kulit',
  'Treatment Experience': 'Pengalaman Treatment',
  'Testimonial & Trust': 'Testimoni & Kepercayaan',
  'Promo & Booking Awareness': 'Promo & Booking',
};

const STATUS_MIGRATION: Record<string, string> = {
  Idea: 'Ide',
  Planned: 'Direncanakan',
  'In Production': 'Sedang Dibuat',
  Posted: 'Sudah Diposting',
};

function normalizePillar(p: string): string {
  return (p && PILLAR_MIGRATION[p]) || p;
}
function normalizeStatus(s: string): string {
  return (s && STATUS_MIGRATION[s]) || s;
}
function normalizePillarText(text: string): string {
  if (!text) return text;
  return text
    .split('\n')
    .map((line) => PILLAR_MIGRATION[line.trim()] || line)
    .join('\n');
}

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
  const b = load<BrandSnapshot | null>(STORAGE_KEYS.brandSnapshot, null);
  if (b && typeof b.contentPillars === 'string') {
    b.contentPillars = normalizePillarText(b.contentPillars);
  }
  return b;
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
  const rows = load<ContentRow[]>(STORAGE_KEYS.contentCalendar, []);
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    ...r,
    pillar: normalizePillar(r.pillar),
    productionStatus: normalizeStatus(r.productionStatus),
  }));
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

/* ---------- Competitor Audit (Module 1.2B) ---------- */
export function getCompetitors(): CompetitorEntry[] {
  return load<CompetitorEntry[]>(STORAGE_KEYS.competitorAudit, []);
}
export function saveCompetitors(rows: CompetitorEntry[]): boolean {
  return save(STORAGE_KEYS.competitorAudit, rows);
}

/* ---------- KOL / UGC Brief (Module 1.2C) ---------- */
export function getKols(): KolEntry[] {
  return load<KolEntry[]>(STORAGE_KEYS.kolBrief, []);
}
export function saveKols(rows: KolEntry[]): boolean {
  return save(STORAGE_KEYS.kolBrief, rows);
}

/* ---------- Drafts ---------- */
export function getDrafts(): DraftMap {
  const map = load<DraftMap>(STORAGE_KEYS.contentDrafts, {}) || {};
  Object.keys(map).forEach((k) => {
    const d = map[k];
    if (d && typeof d.pillar === 'string') d.pillar = normalizePillar(d.pillar);
  });
  return map;
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
    STORAGE_KEYS.competitorAudit,
    STORAGE_KEYS.kolBrief,
  ].forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}
