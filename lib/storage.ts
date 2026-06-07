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
  CampaignRecord,
  CampaignStatus,
  ContentRow,
  ContentDraft,
  DraftMap,
  SeriesBible,
  CompetitorEntry,
  KolEntry,
} from '@/types/content';
import { uid } from './utils';

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

/* ---------- Phase 1.5: multiple campaign records ----------
 * Campaigns now live as an array of CampaignRecord (each with its own
 * calendar) under STORAGE_KEYS.campaigns, plus an activeCampaignId pointer.
 * The legacy single keys (denana_campaign / denana_content_calendar) are
 * migrated into this structure as the first record on first access and then
 * left untouched (never deleted) so existing data is preserved.
 *
 * The classic helpers (getCampaign / saveCampaign / getCalendar /
 * saveCalendar) keep their exact signatures and now read/write the ACTIVE
 * campaign record, so every existing consumer keeps working unchanged.
 */
function normalizeRows(rows: ContentRow[]): ContentRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    ...r,
    pillar: normalizePillar(r.pillar),
    productionStatus: normalizeStatus(r.productionStatus),
  }));
}

function ensureCampaignsMigrated(): void {
  if (!isBrowser()) return;
  // Already migrated if the new key exists (even as an empty array).
  if (window.localStorage.getItem(STORAGE_KEYS.campaigns) !== null) return;

  const oldCampaign = load<Campaign | null>(STORAGE_KEYS.campaign, null);
  const oldCalendar = load<ContentRow[]>(STORAGE_KEYS.contentCalendar, []);
  const records: CampaignRecord[] = [];
  let activeId: string | null = null;

  if (oldCampaign) {
    const now = new Date().toISOString();
    const rec: CampaignRecord = {
      id: uid(),
      campaign: oldCampaign,
      calendar: Array.isArray(oldCalendar) ? oldCalendar : [],
      createdAt: now,
      updatedAt: now,
      status: 'Aktif',
    };
    records.push(rec);
    activeId = rec.id;
  }

  save(STORAGE_KEYS.campaigns, records);
  save(STORAGE_KEYS.activeCampaignId, activeId);
  // NOTE: legacy keys are intentionally kept (no data loss / safe rollback).
}

function applyActiveStatus(records: CampaignRecord[], activeId: string | null): CampaignRecord[] {
  return records.map((r) => {
    if (r.id === activeId) return r.status === 'Aktif' ? r : { ...r, status: 'Aktif' };
    if (r.status === 'Aktif') return { ...r, status: 'Selesai' };
    return r;
  });
}

export function getCampaigns(): CampaignRecord[] {
  ensureCampaignsMigrated();
  const recs = load<CampaignRecord[]>(STORAGE_KEYS.campaigns, []);
  if (!Array.isArray(recs)) return [];
  return recs.map((r) => ({ ...r, calendar: normalizeRows(r.calendar) }));
}

function saveCampaigns(records: CampaignRecord[]): boolean {
  return save(STORAGE_KEYS.campaigns, records);
}

export function getActiveCampaignId(): string | null {
  ensureCampaignsMigrated();
  return load<string | null>(STORAGE_KEYS.activeCampaignId, null);
}

export function getActiveCampaignRecord(): CampaignRecord | null {
  const recs = getCampaigns();
  if (recs.length === 0) return null;
  const id = getActiveCampaignId();
  if (id) {
    const found = recs.find((r) => r.id === id);
    if (found) return found;
  }
  return recs[0];
}

export function setActiveCampaignId(id: string | null): boolean {
  ensureCampaignsMigrated();
  const recs = getCampaigns();
  saveCampaigns(applyActiveStatus(recs, id));
  return save(STORAGE_KEYS.activeCampaignId, id);
}

/**
 * Create a brand-new campaign record. Does NOT overwrite existing campaigns.
 * By default the new record becomes active immediately (the wizard only calls
 * this once the user saves on the final step).
 */
export function createCampaign(
  data: Campaign,
  opts?: { calendar?: ContentRow[]; status?: CampaignStatus; setActive?: boolean },
): CampaignRecord {
  ensureCampaignsMigrated();
  const now = new Date().toISOString();
  const rec: CampaignRecord = {
    id: uid(),
    campaign: data,
    calendar: opts && opts.calendar ? opts.calendar : [],
    createdAt: now,
    updatedAt: now,
    status: (opts && opts.status) || 'Aktif',
  };
  let recs = getCampaigns();
  recs.push(rec);
  const setActive = !opts || opts.setActive !== false;
  if (setActive) recs = applyActiveStatus(recs, rec.id);
  saveCampaigns(recs);
  if (setActive) save(STORAGE_KEYS.activeCampaignId, rec.id);
  return rec;
}

/* ---------- Classic helpers (now backed by the ACTIVE campaign record) ---------- */
export function getCampaign(): Campaign | null {
  const rec = getActiveCampaignRecord();
  return rec ? rec.campaign : null;
}

/**
 * Update the ACTIVE campaign's data. If no campaign exists yet (e.g. the manual
 * form is used to create the very first campaign), a new active record is
 * created so the historical "save creates a campaign" behavior still holds.
 */
export function saveCampaign(data: Campaign): boolean {
  ensureCampaignsMigrated();
  const recs = getCampaigns();
  const id = getActiveCampaignId();
  const now = new Date().toISOString();
  const idx = id ? recs.findIndex((r) => r.id === id) : -1;
  if (idx >= 0) {
    recs[idx] = { ...recs[idx], campaign: data, updatedAt: now };
    return saveCampaigns(recs);
  }
  createCampaign(data, { setActive: true });
  return true;
}

export function getCalendar(): ContentRow[] {
  const rec = getActiveCampaignRecord();
  return rec ? normalizeRows(rec.calendar) : [];
}

/** Save calendar rows onto the ACTIVE campaign record. */
export function saveCalendar(rows: ContentRow[]): boolean {
  ensureCampaignsMigrated();
  const recs = getCampaigns();
  const id = getActiveCampaignId();
  const now = new Date().toISOString();
  let idx = id ? recs.findIndex((r) => r.id === id) : -1;
  if (idx < 0 && recs.length > 0) idx = 0;
  if (idx >= 0) {
    recs[idx] = { ...recs[idx], calendar: rows, updatedAt: now };
    return saveCampaigns(recs);
  }
  return false;
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
    STORAGE_KEYS.campaigns,
    STORAGE_KEYS.activeCampaignId,
  ].forEach((k) => {
    try {
      window.localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  });
}
