/*
 * campaignPlan.ts (Phase 16G)
 * Pure helpers that turn Create Campaign Wizard answers into a Campaign record
 * + an initial content plan. This REUSES the existing generator
 * (generateCalendar) and the existing storage shapes — it does NOT change the
 * generation logic, the data model, or the storage schema.
 *
 * Responsibilities:
 *  - Resolve the goal / period / focus / frequency / platforms answers.
 *  - Build a Campaign object compatible with the existing storage model.
 *  - Generate the daily plan via generateCalendar, then down-sample to match
 *    the chosen posting frequency (spreading posts evenly across the period).
 *  - Guarantee every generated row starts as Planning with empty scheduling.
 *
 * The caller (the wizard) is responsible for persisting via createCampaign().
 */
import type { BrandSnapshot, Campaign, ContentRow } from '@/types/content';
import { generateCalendar } from './generator';
import { toISO, dayName } from './utils';

export type WizardFrequency = 'daily' | '3pw' | '5pw' | 'custom';

export interface WizardInput {
  /** Chosen goal label (e.g. "Awareness", "Booking", or a custom string). */
  goal: string;
  periodStart: string; // ISO yyyy-mm-dd
  periodEnd: string; // ISO yyyy-mm-dd
  focusName: string;
  focusDesc?: string;
  frequency: WizardFrequency;
  /** Posts per week when frequency === 'custom' (1..7). */
  customPerWeek?: number;
  platforms: string[];
  /** Optional manual campaign name; auto-generated when blank. */
  campaignName?: string;
}

export interface BuiltPlan {
  campaign: Campaign;
  rows: ContentRow[];
  estimatedCount: number;
  dayCount: number;
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/* Mirror of generator.campaignDayCount so the wizard can estimate the content
 * count without generating. Inclusive day span, valid 1..60, else 30. */
export function effectiveDayCount(periodStart: string, periodEnd: string): number {
  if (periodStart && periodEnd) {
    const s = new Date(periodStart + 'T00:00:00');
    const e = new Date(periodEnd + 'T00:00:00');
    if (!isNaN(s.getTime()) && !isNaN(e.getTime())) {
      const diff = Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
      if (diff >= 1 && diff <= 60) return diff;
    }
  }
  return 30;
}

/** Posts-per-week implied by the chosen frequency. */
export function perWeekFor(freq: WizardFrequency, customPerWeek?: number): number {
  if (freq === 'daily') return 7;
  if (freq === '3pw') return 3;
  if (freq === '5pw') return 5;
  return clamp(Math.round(customPerWeek || 3), 1, 7);
}

/** Human-readable frequency description stored on the campaign. */
export function frequencyLabel(freq: WizardFrequency, customPerWeek?: number): string {
  if (freq === 'daily') return '1 content per day';
  if (freq === '3pw') return '3 contents per week';
  if (freq === '5pw') return '5 contents per week';
  const n = perWeekFor('custom', customPerWeek);
  return n + (n === 1 ? ' content per week' : ' contents per week');
}

/** Estimated number of content rows for a period + frequency. */
export function estimateCount(
  periodStart: string,
  periodEnd: string,
  freq: WizardFrequency,
  customPerWeek?: number,
): number {
  const dayCount = effectiveDayCount(periodStart, periodEnd);
  const perWeek = perWeekFor(freq, customPerWeek);
  if (perWeek >= 7) return dayCount;
  return clamp(Math.round((dayCount / 7) * perWeek), 1, dayCount);
}

/**
 * Build a readable campaign name from focus + goal when the user did not type
 * one. Examples: "Facial Booking Campaign", "Hydra Peel Awareness Campaign".
 */
export function buildCampaignName(input: {
  campaignName?: string;
  focusName: string;
  goal: string;
}): string {
  const manual = (input.campaignName || '').trim();
  if (manual) return manual;
  const focus = (input.focusName || '').trim();
  const goal = (input.goal || '').trim();
  const parts = [focus, goal, 'Campaign'].filter(Boolean);
  const name = parts.join(' ').replace(/\s+/g, ' ').trim();
  return name || 'New Campaign';
}

/**
 * Build the campaign + initial content plan from wizard answers.
 * Reuses generateCalendar, then evenly down-samples to the chosen frequency.
 */
export function buildPlan(brand: BrandSnapshot | null, input: WizardInput): BuiltPlan {
  const campaignName = buildCampaignName(input);
  const campaign: Campaign = {
    campaignName,
    periodStart: input.periodStart,
    periodEnd: input.periodEnd,
    priorityService: (input.focusName || '').trim(),
    campaignGoal: (input.goal || '').trim(),
    mainPlatform: input.platforms.join(', '),
    postingFrequency: frequencyLabel(input.frequency, input.customPerWeek),
    notes: (input.focusDesc || '').trim(),
  };

  // Reuse the existing generator. It returns one row per day across the period
  // (already Planning, with null scheduling), so its length is the true span.
  const dailyRows = generateCalendar(brand, campaign);
  const dayCount = dailyRows.length;
  if (dayCount === 0) {
    return { campaign, rows: [], estimatedCount: 0, dayCount: 0 };
  }

  const perWeek = perWeekFor(input.frequency, input.customPerWeek);
  const target =
    perWeek >= 7 ? dayCount : clamp(Math.round((dayCount / 7) * perWeek), 1, dayCount);

  const start = new Date(input.periodStart + 'T00:00:00');
  const startValid = !isNaN(start.getTime());

  const rows: ContentRow[] = [];
  const used = new Set<number>();
  for (let i = 0; i < target; i++) {
    // Spread the chosen posts evenly across the available days.
    let off = target <= 1 ? 0 : Math.round((i * (dayCount - 1)) / (target - 1));
    while (used.has(off) && off < dayCount - 1) off++;
    while (used.has(off) && off > 0) off--;
    used.add(off);

    const src = dailyRows[Math.min(off, dailyRows.length - 1)];
    let date = src.date;
    let day = src.day;
    if (startValid) {
      const d = new Date(start.getTime());
      d.setDate(start.getDate() + off);
      date = toISO(d);
      day = dayName(d);
    }
    rows.push({
      ...src,
      date,
      day,
      // Phase 16B/16G guarantee: fresh content starts in Planning, unscheduled.
      productionStatus: 'Planning',
      scheduledDate: null,
      scheduledTime: null,
      assignee: null,
    });
  }

  rows.sort((a, b) => a.date.localeCompare(b.date));
  return { campaign, rows, estimatedCount: rows.length, dayCount };
}
