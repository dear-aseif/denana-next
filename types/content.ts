/*
 * Shared domain types for Denana Next OS.
 * These describe the data the app generates and stores (locally) in Phase 1.
 */

export type Pillar =
  | 'Edukasi Facial'
  | 'Masalah & Solusi Kulit'
  | 'Pengalaman Treatment'
  | 'Testimoni & Kepercayaan'
  | 'Promo & Booking';

export type ContentFormat = 'Reels' | 'Carousel' | 'Single Post' | 'Stories' | 'Live';

export type Objective = 'Awareness' | 'Engagement' | 'Trust' | 'Booking';

/**
 * Legacy production status (Phase 1, Bahasa Indonesia). Kept ONLY for backward
 * compatibility / migration. New code should use ContentStatus below.
 */
export type ProductionStatus = 'Ide' | 'Direncanakan' | 'Sedang Dibuat' | 'Sudah Diposting';

/**
 * Phase 16B canonical content workflow status (English).
 * Flow: Planning -> Scheduled -> In Production -> Ready to Post -> Posted.
 * Old Indonesian/English values are normalized into this set on read via
 * normalizeContentStatus() in lib/labels.ts.
 */
export type ContentStatus =
  | 'Planning'
  | 'Scheduled'
  | 'In Production'
  | 'Ready to Post'
  | 'Posted';

/**
 * Phase 16B simulated assignee. No auth / no real accounts yet — just a label
 * so content can be "owned" by a person for the Work Calendar later.
 */
export type ContentAssignee = 'Owner' | 'Staff 1' | 'Staff 2' | 'Designer';

/** Brand profile (Profil Brand). */
export interface BrandSnapshot {
  businessName: string;
  instagramHandle: string;
  area: string;
  niche: string;
  targetAudience: string;
  mainService: string;
  serviceDetails: string;
  entryPrice: string;
  usp: string;
  primaryCTA: string;
  ctaLink: string;
  websiteLink: string;
  primaryColor: string;
  secondaryColor: string;
  visualStyle: string;
  toneOfVoice: string;
  tagline: string;
  platforms: string;
  contentPillars: string;
}

/** Campaign plan (Rencana Campaign). */
export interface Campaign {
  campaignName: string;
  periodStart: string;
  periodEnd: string;
  priorityService: string;
  campaignGoal: Objective | string;
  mainPlatform: string;
  postingFrequency: string;
  notes: string;
}

/** Simple lifecycle status for a stored campaign record. */
export type CampaignStatus = 'Aktif' | 'Draft' | 'Selesai';

/**
 * Phase 1.5: a self-contained campaign record stored locally. Each record
 * carries its own campaign data AND its own content calendar so multiple
 * campaigns can coexist without overwriting one another.
 */
export interface CampaignRecord {
  id: string;
  campaign: Campaign;
  calendar: ContentRow[];
  createdAt: string;
  updatedAt: string;
  status: CampaignStatus;
}

/**
 * A single row in the content calendar (Rencana Konten) — the master content
 * item. Content Planner is the source of truth for these.
 *
 * Phase 16B added scheduling + assignee + timestamp fields. They are all
 * OPTIONAL so existing localStorage rows (which lack them) never break; missing
 * values are defaulted/normalized on read (see lib/storage.ts).
 */
export interface ContentRow {
  /** Stable content id (a.k.a. contentId). */
  id: string;
  /** Owning campaign id. Backfilled on read for legacy rows. */
  campaignId?: string;
  date: string;
  day: string;
  format: ContentFormat | string;
  pillar: Pillar | string;
  /** Title / topic of the content. */
  topicTitle: string;
  hook: string;
  cta: string;
  /** Marketing goal / objective. */
  objective: Objective | string;
  /**
   * Canonical content status. Stored as ContentStatus going forward; legacy
   * ProductionStatus values are migrated to ContentStatus on read. The field
   * name is kept as `productionStatus` for backward compatibility with every
   * existing consumer.
   */
  productionStatus: ContentStatus | ProductionStatus | string;
  /** Work Calendar assignment date (ISO yyyy-mm-dd). null/'' = not scheduled. */
  scheduledDate?: string | null;
  /** Optional scheduled time (HH:mm). */
  scheduledTime?: string | null;
  /** Simulated assignee (Owner / Staff 1 / Staff 2 / Designer). */
  assignee?: ContentAssignee | string | null;
  /** ISO timestamps. Backfilled on read for legacy rows. */
  createdAt?: string;
  updatedAt?: string;
}

export interface ScriptScene {
  time: string;
  visual: string;
  voiceover: string;
  overlayText: string;
}

export interface ContentScript {
  opening: string;
  sceneByScene: ScriptScene[];
  closingCTA: string;
}

/** The generated detail for a single content idea (caption, script, etc.). */
export interface ContentDetail {
  caption: string;
  shortCaption: string;
  script: ContentScript;
  visualDirection: string;
  overlayOptions: string[];
  hashtags: string[];
  checklist: string[];
}

/** A saved content draft, keyed by the content row id. */
export interface ContentDraft {
  id: string;
  savedAt: string;
  topicTitle: string;
  pillar: string;
  format: string;
  detail: ContentDetail;
}

export type DraftMap = Record<string, ContentDraft>;

/** Metadata describing a single Brand Profile form field. */
export interface BrandField {
  key: keyof BrandSnapshot;
  label: string;
  hint: string;
  req?: boolean;
  type?: 'textarea';
  full?: boolean;
}

/** A topic entry inside a pillar's topic bank. */
export interface TopicBankItem {
  t: string; // topic title
  h: string; // hook
  f: ContentFormat; // suggested format
}

export interface PillarPlanEntry {
  pillar: Pillar;
  count: number;
}

/* ---------- Series Bible (Module 1.1 — Brand DNA) ---------- */

/** A single content pillar expanded for the Series Bible. */
export interface SeriesBiblePillar {
  name: string;
  goal: string;
  description: string;
  exampleAngles: string[];
}

/** Representative audience persona with pain points. */
export interface AudiencePersona {
  name: string;
  snapshot: string;
  goals: string[];
  painPoints: string[];
}

/** Visual identity guidance. */
export interface VisualDNA {
  primaryColor: string;
  secondaryColor: string;
  style: string;
  moodKeywords: string[];
  dos: string[];
  donts: string[];
}

/** Reusable caption structure + guardrails. */
export interface CaptionFramework {
  structure: string[];
  dos: string[];
  donts: string[];
}

export interface PillarRatioEntry {
  pillar: string;
  count: number;
  pct: string;
}

export interface PostingStrategy {
  cadence: string;
  formatMix: string[];
  pillarRatio: PillarRatioEntry[];
  tips: string[];
}

/** The full generated Series Bible, derived from the Brand Snapshot. */
export interface SeriesBible {
  generatedAt: string;
  businessName: string;
  tagline: string;
  manifesto: string;
  positioning: string;
  toneOfVoice: string;
  persona: AudiencePersona;
  visual: VisualDNA;
  caption: CaptionFramework;
  pillars: SeriesBiblePillar[];
  postingStrategy: PostingStrategy;
  hashtags: string[];
}

/* ---------- Competitor Organic Audit (Module 1.2B) ---------- */

/** One focus area to evaluate when auditing a competitor. */
export interface AuditFocusArea {
  area: string;
  question: string;
  lookFor: string[];
}

/** The generated audit framework, derived from the Brand Snapshot. */
export interface AuditFramework {
  generatedAt: string;
  businessName: string;
  intro: string;
  focusAreas: AuditFocusArea[];
  gapSignals: string[];
  ourAngles: string[];
  tips: string[];
}

/** A single competitor entry, filled in manually by the user. */
export interface CompetitorEntry {
  id: string;
  name: string;
  handle: string;
  followers: string;
  strengths: string;
  weaknesses: string;
  opportunities: string;
}

/* ---------- KOL / UGC Brief (Module 1.2C) ---------- */

/** The generated KOL / UGC collaboration brief, derived from the Brand Snapshot. */
export interface KolBrief {
  generatedAt: string;
  businessName: string;
  campaignGoal: string;
  coreMessage: string;
  audience: string;
  mustMention: string[];
  contentAngles: string[];
  dos: string[];
  donts: string[];
  deliverables: string[];
  hashtags: string[];
}

/** A single KOL / creator entry, filled in manually by the user. */
export interface KolEntry {
  id: string;
  name: string;
  platform: string;
  followers: string;
  contentType: string;
  status: string;
  notes: string;
}
