/*
 * goalStrategy.ts (Phase 16H)
 * Goal / platform / focus aware strategy mapping for content generation.
 *
 * The Create Campaign Wizard collects campaign INTENT (goal, focus, platforms).
 * This module turns that intent into concrete generation decisions:
 *   - which pillars to use and in what angle arc (getGoalStrategy)
 *   - which content formats to favor (getPlatformStrategy / chooseFormatForPlatforms)
 *   - a goal + platform aware CTA (buildGoalAwareCTA)
 *   - a focus-biased topic pick from the existing topic bank (buildGoalAwareTopic)
 *
 * IMPORTANT: This does NOT add new pillars, formats, statuses, or storage keys.
 * It only reorders / biases the EXISTING Bahasa Indonesia content banks so the
 * output stays compatible with the Phase 16B/16F content model. Generated copy
 * remains Indonesian (no localization here) but the STRATEGY reflects the goal,
 * platforms, and product/service focus chosen in the wizard.
 */
import { TOPIC_BANK } from '@/data/sampleContent';
import type { ContentFormat, Objective, TopicBankItem } from '@/types/content';

/* ---------- Existing pillar keys (must match TOPIC_BANK / PILLARS) ---------- */
export const PILLAR_EDU = 'Edukasi Facial'; // Education / tips / intro
export const PILLAR_PROB = 'Masalah & Solusi Kulit'; // Problem & solution
export const PILLAR_EXP = 'Pengalaman Treatment'; // Process / experience / BTS
export const PILLAR_TRUST = 'Testimoni & Kepercayaan'; // Testimonial / proof / FAQ
export const PILLAR_PROMO = 'Promo & Booking'; // Offer / booking / urgency

/* ---------- Canonical goals ---------- */
export type CanonicalGoal =
  | 'Awareness'
  | 'Engagement'
  | 'Booking'
  | 'Sales'
  | 'Education'
  | 'Trust Building';

/**
 * Map any goal string (wizard option OR a custom goal) to a canonical goal so
 * the strategy is always defined. Unknown goals fall back to Awareness.
 */
export function normalizeGoal(goal?: string): CanonicalGoal {
  const g = (goal || '').toLowerCase();
  if (g.includes('engage') || g.includes('comment') || g.includes('interact'))
    return 'Engagement';
  if (g.includes('book') || g.includes('appoint') || g.includes('reserv'))
    return 'Booking';
  if (
    g.includes('sale') ||
    g.includes('sell') ||
    g.includes('promo') ||
    g.includes('offer') ||
    g.includes('discount') ||
    g.includes('convert')
  )
    return 'Sales';
  if (g.includes('edu') || g.includes('teach') || g.includes('learn') || g.includes('authority'))
    return 'Education';
  if (
    g.includes('trust') ||
    g.includes('cred') ||
    g.includes('proof') ||
    g.includes('testi')
  )
    return 'Trust Building';
  // 'aware', 'discover', 'reach', 'brand', and anything unknown.
  return 'Awareness';
}

export interface GoalStrategy {
  goal: CanonicalGoal;
  /** Canonical objective written onto each generated row (Content Planner Goal column). */
  objective: Objective;
  /**
   * Ordered pillar arc (length ~7). Generation cycles through this so a 7-day
   * campaign produces one meaningfully different angle per day, and longer
   * campaigns repeat the arc instead of clustering one pillar.
   */
  pillarSequence: string[];
  /** Human-readable angle arc — used for docs / future tooltips. */
  angleArc: string[];
}

/*
 * Each goal maps to an angle arc expressed with the EXISTING five pillars:
 *   Education (EDU), Problem & Solution (PROB), Experience/Process (EXP),
 *   Testimonial/Trust/FAQ (TRUST), Offer/Booking/Promo (PROMO).
 */
const GOAL_STRATEGIES: Record<CanonicalGoal, GoalStrategy> = {
  Awareness: {
    goal: 'Awareness',
    objective: 'Awareness',
    pillarSequence: [PILLAR_EDU, PILLAR_PROB, PILLAR_EDU, PILLAR_EXP, PILLAR_PROB, PILLAR_EDU, PILLAR_PROMO],
    angleArc: ['intro', 'problem framing', 'tips', 'service intro', 'local problem', 'myth', 'soft CTA'],
  },
  Engagement: {
    goal: 'Engagement',
    objective: 'Engagement',
    pillarSequence: [PILLAR_PROB, PILLAR_EDU, PILLAR_EXP, PILLAR_PROB, PILLAR_TRUST, PILLAR_EDU, PILLAR_PROB],
    angleArc: ['relatable problem', 'question', 'experience', 'this-or-that', 'story prompt', 'tip', 'poll'],
  },
  Booking: {
    goal: 'Booking',
    objective: 'Booking',
    pillarSequence: [PILLAR_PROB, PILLAR_EDU, PILLAR_EXP, PILLAR_TRUST, PILLAR_TRUST, PILLAR_PROMO, PILLAR_PROMO],
    angleArc: ['pain', 'benefit', 'process', 'objection', 'proof', 'urgency', 'booking'],
  },
  Sales: {
    goal: 'Sales',
    objective: 'Booking',
    pillarSequence: [PILLAR_PROMO, PILLAR_EDU, PILLAR_TRUST, PILLAR_EXP, PILLAR_PROMO, PILLAR_TRUST, PILLAR_PROMO],
    angleArc: ['offer', 'value', 'testimonial', 'before-after', 'bundle', 'objection', 'urgency'],
  },
  Education: {
    goal: 'Education',
    objective: 'Awareness',
    pillarSequence: [PILLAR_EDU, PILLAR_EDU, PILLAR_EXP, PILLAR_EDU, PILLAR_PROB, PILLAR_EDU, PILLAR_TRUST],
    angleArc: ['education', 'explanation', 'process', 'step-by-step', 'myth vs fact', 'aftercare', 'FAQ'],
  },
  'Trust Building': {
    goal: 'Trust Building',
    objective: 'Trust',
    pillarSequence: [PILLAR_EXP, PILLAR_EXP, PILLAR_TRUST, PILLAR_TRUST, PILLAR_TRUST, PILLAR_EXP, PILLAR_PROMO],
    angleArc: ['process', 'hygiene', 'staff/owner', 'testimonial', 'customer story', 'FAQ', 'consultation'],
  },
};

/** Resolve the strategy for any goal string (incl. custom). */
export function getGoalStrategy(goal?: string): GoalStrategy {
  return GOAL_STRATEGIES[normalizeGoal(goal)];
}

/* ============================================================
   PLATFORM STRATEGY
   ============================================================ */

/* Preferred format pools per platform, using ONLY existing ContentFormat
 * labels. Repeated entries (e.g. TikTok Reels) act as soft weights. */
const PLATFORM_FORMATS: Record<string, ContentFormat[]> = {
  instagram: ['Reels', 'Carousel', 'Stories', 'Single Post'],
  facebook: ['Single Post', 'Carousel', 'Stories'],
  tiktok: ['Reels', 'Reels', 'Carousel'],
  whatsapp: ['Single Post', 'Stories'],
  website: ['Carousel', 'Single Post'],
};

type PlatformKey = keyof typeof PLATFORM_FORMATS;

function platformKey(p: string): PlatformKey | null {
  const s = (p || '').toLowerCase();
  if (s.includes('insta')) return 'instagram';
  if (s.includes('face')) return 'facebook';
  if (s.includes('tiktok') || s.includes('tik tok')) return 'tiktok';
  if (s.includes('whatsapp')) return 'whatsapp';
  if (s.includes('web') || s.includes('blog')) return 'website';
  return null;
}

export interface PlatformStrategy {
  platforms: string[];
  /** Interleaved pool of formats to rotate through, biased by selected platforms. */
  formatPool: ContentFormat[];
  usesWhatsApp: boolean;
  usesTikTok: boolean;
}

/* Round-robin interleave so multiple platforms mix (instead of clustering one
 * platform's formats together). */
function interleave(arrays: ContentFormat[][]): ContentFormat[] {
  const out: ContentFormat[] = [];
  let max = 0;
  for (const a of arrays) max = Math.max(max, a.length);
  for (let i = 0; i < max; i++) {
    for (const a of arrays) {
      if (i < a.length) out.push(a[i]);
    }
  }
  return out;
}

export function getPlatformStrategy(platforms?: string[]): PlatformStrategy {
  const list = Array.isArray(platforms) ? platforms.filter(Boolean) : [];
  const keys: PlatformKey[] = [];
  for (const p of list) {
    const k = platformKey(p);
    if (k && !keys.includes(k)) keys.push(k);
  }
  const pools = keys.map((k) => PLATFORM_FORMATS[k]);
  let formatPool = interleave(pools);
  if (formatPool.length === 0) {
    formatPool = ['Reels', 'Carousel', 'Single Post', 'Stories'];
  }
  return {
    platforms: list,
    formatPool,
    usesWhatsApp: keys.includes('whatsapp'),
    usesTikTok: keys.includes('tiktok'),
  };
}

/** Pick a single format for a given day index, biased by selected platforms. */
export function chooseFormatForPlatforms(
  platforms: string[] | undefined,
  index: number,
): ContentFormat {
  const pool = getPlatformStrategy(platforms).formatPool;
  return pool[index % pool.length];
}

/* ============================================================
   FOCUS + CTA HELPERS
   ============================================================ */

type TreatmentFocus = 'Hydra Peel' | 'Microdermabrasion' | 'Totok wajah' | 'General';

/** Detect a specific treatment from the product/service focus text. */
export function detectFocusTreatment(focus?: string): TreatmentFocus {
  const s = (focus || '').toLowerCase();
  if (s.includes('hydra')) return 'Hydra Peel';
  if (s.includes('microderm') || s.includes('mikroderm')) return 'Microdermabrasion';
  if (s.includes('totok')) return 'Totok wajah';
  return 'General';
}

function focusPhrase(focus?: string): string {
  const f = (focus || '').trim();
  return f || 'facial treatment';
}

/*
 * Goal-aware CTA templates (Bahasa Indonesia, to stay consistent with the rest
 * of the generated copy). Tokens:
 *   __FOCUS__ -> the product/service focus
 *   __WA__    -> ' lewat WhatsApp' when WhatsApp is a selected platform, else ''
 * Plain tokens (not braces) avoid any templating ambiguity.
 */
const GOAL_CTA_TEMPLATES: Record<CanonicalGoal, string[]> = {
  Awareness: [
    'Simpan dulu kalau info ini bermanfaat.',
    'Follow untuk tips perawatan wajah lainnya.',
    'DM kami__WA__ kalau mau tahu treatment yang cocok untuk kulitmu.',
  ],
  Engagement: [
    'Yang mana paling sering kamu alami? Tulis di komentar.',
    'Komentar keluhan kulitmu di bawah ya.',
    'DM kami__WA__ tipe kulitmu, nanti kami bantu kenali.',
  ],
  Booking: [
    'Booking __FOCUS__ sekarang__WA__.',
    'Amankan slot __FOCUS__ minggu ini__WA__.',
    'Ketuk untuk booking sesi __FOCUS____WA__.',
  ],
  Sales: [
    'Klaim penawaran __FOCUS__ ini sekarang__WA__.',
    'Tanya promo __FOCUS__ hari ini ke kami__WA__.',
    'Booking sebelum slotnya habis__WA__.',
  ],
  Education: [
    'Simpan panduan ini untuk nanti.',
    'Bagikan ke teman yang butuh info ini.',
    'Tanya kami__WA__ kalau ragu treatment mana yang cocok.',
  ],
  'Trust Building': [
    'Lihat bagaimana kami menangani __FOCUS__.',
    'Tanya apa saja sebelum booking__WA__.',
    'DM kami__WA__ untuk konsultasi dulu.',
  ],
};

/** Build a CTA that reflects BOTH the campaign goal and selected platforms. */
export function buildGoalAwareCTA(
  goal: string | undefined,
  platforms: string[] | undefined,
  focus: string | undefined,
  index: number,
): string {
  const strat = getGoalStrategy(goal);
  const ps = getPlatformStrategy(platforms);
  const templates = GOAL_CTA_TEMPLATES[strat.goal];
  const tpl = templates[index % templates.length];
  const wa = ps.usesWhatsApp ? ' lewat WhatsApp' : '';
  return tpl
    .split('__FOCUS__')
    .join(focusPhrase(focus))
    .split('__WA__')
    .join(wa)
    .replace(/\s+/g, ' ')
    .trim();
}

/* ============================================================
   FOCUS-BIASED TOPIC SELECTION
   ============================================================ */

/**
 * Pick a topic from the EXISTING bank for a pillar, biased toward the campaign
 * focus when the focus names a specific treatment (e.g. "Hydra Peel"). When the
 * focus is generic, rotates through the bank normally. `cursor` advances per
 * pillar so topics within a campaign don't repeat back-to-back.
 */
export function buildGoalAwareTopic(
  pillar: string,
  cursor: number,
  focus: string | undefined,
): TopicBankItem {
  const bank = TOPIC_BANK[pillar] || [];
  if (bank.length === 0) {
    return {
      t: 'Facial treatment di DenanavBeauty Salon',
      h: 'Yuk kenali facial treatment kami.',
      f: 'Single Post',
    };
  }
  const treatment = detectFocusTreatment(focus);
  if (treatment !== 'General') {
    const needle = treatment.toLowerCase().split(' ')[0]; // hydra / microdermabrasion / totok
    const matches = bank.filter((it) =>
      (it.t + ' ' + it.h).toLowerCase().includes(needle),
    );
    if (matches.length > 0) {
      return matches[cursor % matches.length];
    }
  }
  return bank[cursor % bank.length];
}
