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
  ContentStatus,
  ContentAssignee,
  ContentDraft,
  DraftMap,
  SeriesBible,
  CompetitorEntry,
  KolEntry,
} from '@/types/content';
import { uid } from './utils';
import { normalizeContentStatus } from './labels';

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

/*
 * Phase 16B: content status is now canonical English (ContentStatus). Legacy
 * Indonesian/English values are migrated on read via normalizeContentStatus()
 * from lib/labels. (The old English->Indonesian STATUS_MIGRATION was removed;
 * the direction is now reversed and centralized in lib/labels.)
 */
function normalizePillar(p: string): string {
  return (p && PILLAR_MIGRATION[p]) || p;
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
/*
 * Normalize content rows on read so the rest of the app only ever sees clean
 * data: migrated pillar names, canonical ContentStatus, a backfilled
 * campaignId, and null-defaulted scheduling/assignee fields. Old rows missing
 * the Phase 16B fields therefore never crash a consumer.
 */
function normalizeRows(rows: ContentRow[], campaignId?: string): ContentRow[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((r) => ({
    ...r,
    campaignId: r.campaignId || campaignId,
    pillar: normalizePillar(r.pillar),
    productionStatus: normalizeContentStatus(r.productionStatus),
    scheduledDate: r.scheduledDate ?? null,
    scheduledTime: r.scheduledTime ?? null,
    assignee: r.assignee ?? null,
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
  return recs.map((r) => ({ ...r, calendar: normalizeRows(r.calendar, r.id) }));
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
  return rec ? normalizeRows(rec.calendar, rec.id) : [];
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

/* ---------- Phase 16B: content status + Work Calendar helpers ----------
 * These operate on the master content rows stored inside each
 * CampaignRecord.calendar. They never duplicate content: the Work Calendar is
 * a *view* over rows that have a scheduledDate, always referencing the original
 * content item by id. Mutations update in place and persist via saveCampaigns,
 * so Content Planner, Dashboard, and a future Work Calendar all read the same
 * source of truth.
 */

/** A content row enriched with its owning campaign context (for Work Calendar). */
export interface WorkItem extends ContentRow {
  campaignId: string;
  campaignName: string;
}

/**
 * Find and mutate a single content row across ALL campaigns, then persist.
 * Returns the updated row (with a refreshed updatedAt) or null if not found.
 */
function mutateContentRow(
  contentId: string,
  mutate: (row: ContentRow) => ContentRow,
): ContentRow | null {
  const recs = getCampaigns();
  let updated: ContentRow | null = null;
  const now = new Date().toISOString();
  const next = recs.map((rec) => {
    let touched = false;
    const calendar = rec.calendar.map((row) => {
      if (row.id !== contentId) return row;
      const result: ContentRow = { ...mutate(row), updatedAt: now };
      updated = result;
      touched = true;
      return result;
    });
    return touched ? { ...rec, calendar, updatedAt: now } : rec;
  });
  if (updated) saveCampaigns(next);
  return updated;
}

/** Update a content item's workflow status (normalized to ContentStatus). */
export function updateContentStatus(
  contentId: string,
  status: ContentStatus | string,
): ContentRow | null {
  return mutateContentRow(contentId, (row) => ({
    ...row,
    productionStatus: normalizeContentStatus(status),
  }));
}

/** Update a content item's simulated assignee. Pass null to clear. */
export function updateContentAssignee(
  contentId: string,
  assignee: ContentAssignee | string | null,
): ContentRow | null {
  return mutateContentRow(contentId, (row) => ({
    ...row,
    assignee: assignee || null,
  }));
}

/**
 * Assign a content item to a date on the Work Calendar.
 * - Sets scheduledDate (+ optional time + assignee).
 * - Bumps status Planning -> Scheduled (leaves later statuses untouched).
 * - Does NOT remove the item from Content Planner (still the master list).
 */
export function assignContentToWorkCalendar(
  contentId: string,
  opts: { date: string; time?: string | null; assignee?: ContentAssignee | string | null },
): ContentRow | null {
  return mutateContentRow(contentId, (row) => {
    const current = normalizeContentStatus(row.productionStatus);
    return {
      ...row,
      scheduledDate: opts.date || null,
      scheduledTime: opts.time ?? row.scheduledTime ?? null,
      assignee: opts.assignee ?? row.assignee ?? null,
      productionStatus: current === 'Planning' ? 'Scheduled' : current,
    };
  });
}

/** Remove a Work Calendar assignment (keeps the item in the Content Planner). */
export function unassignContentFromWorkCalendar(contentId: string): ContentRow | null {
  return mutateContentRow(contentId, (row) => {
    const current = normalizeContentStatus(row.productionStatus);
    return {
      ...row,
      scheduledDate: null,
      scheduledTime: null,
      productionStatus: current === 'Scheduled' ? 'Planning' : current,
    };
  });
}

/** All scheduled content across campaigns, as Work Calendar items (date-sorted). */
export function getWorkItems(): WorkItem[] {
  const items: WorkItem[] = [];
  getCampaigns().forEach((rec) => {
    rec.calendar.forEach((row) => {
      if (row.scheduledDate) {
        items.push({ ...row, campaignId: rec.id, campaignName: rec.campaign.campaignName });
      }
    });
  });
  items.sort((a, b) => {
    const ad = (a.scheduledDate || '') + (a.scheduledTime || '');
    const bd = (b.scheduledDate || '') + (b.scheduledTime || '');
    return ad < bd ? -1 : ad > bd ? 1 : 0;
  });
  return items;
}

function localTodayISO(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

/** Work items scheduled for today. */
export function getTodayWorkItems(): WorkItem[] {
  const today = localTodayISO();
  return getWorkItems().filter((i) => (i.scheduledDate || '').slice(0, 10) === today);
}

/** Work items scheduled after today (upcoming). */
export function getUpcomingWorkItems(): WorkItem[] {
  const today = localTodayISO();
  return getWorkItems().filter((i) => (i.scheduledDate || '').slice(0, 10) > today);
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
