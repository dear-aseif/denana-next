'use client';

/*
 * CreateCampaignWizard (Phase 16G)
 * A lightweight, guided 6-step modal that turns a campaign idea into a created
 * campaign + an initial content plan.
 *
 * Flow: Goal -> Period -> Focus -> Frequency -> Platforms -> Review.
 *
 * It reuses the existing modal pattern (.modal-overlay / .modal / .modal-head /
 * .modal-body / .modal-foot), the shared Button, and the existing storage +
 * generator. It does NOT change the status model, Work Calendar logic, the
 * Content Planner, the Dashboard, or the storage schema.
 *
 * On Generate it calls createCampaign() (which never overwrites existing
 * campaigns and sets the new one active), then routes the user to the Content
 * Planner. Generated rows start as Planning with empty scheduling — nothing is
 * auto-assigned to the Work Calendar.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrand, createCampaign } from '@/lib/storage';
import {
  buildPlan,
  buildCampaignName,
  estimateCount,
  frequencyLabel,
  type WizardFrequency,
  type WizardInput,
} from '@/lib/campaignPlan';
import { fmtDate } from '@/lib/utils';
import { useToast } from './ToastProvider';
import Button from './Button';

const TOTAL_STEPS = 6;

const GOALS = [
  { id: 'Awareness', label: 'Awareness', desc: 'Get discovered by new people.' },
  { id: 'Engagement', label: 'Engagement', desc: 'Spark likes, comments, and shares.' },
  { id: 'Booking', label: 'Booking', desc: 'Drive appointment bookings.' },
  { id: 'Sales', label: 'Sales', desc: 'Promote offers and convert buyers.' },
  { id: 'Education', label: 'Education', desc: 'Teach and build authority.' },
  { id: 'Trust Building', label: 'Trust Building', desc: 'Show proof and credibility.' },
];

const FREQUENCIES: Array<{ id: WizardFrequency; label: string; desc: string }> = [
  { id: 'daily', label: '1 content per day', desc: 'Highest volume — one post every day.' },
  { id: '3pw', label: '3 contents per week', desc: 'Steady, sustainable cadence.' },
  { id: '5pw', label: '5 contents per week', desc: 'Active, weekday-focused cadence.' },
  { id: 'custom', label: 'Custom', desc: 'Choose your own posts per week.' },
];

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'WhatsApp', 'Website / Blog'];

const fieldGapStyle: React.CSSProperties = { marginTop: 14 };
const customNumStyle: React.CSSProperties = { marginTop: 14, maxWidth: 200 };

function todayISO(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

function addDaysISO(startISO: string, days: number): string {
  const d = new Date(startISO + 'T00:00:00');
  if (isNaN(d.getTime())) return startISO;
  d.setDate(d.getDate() + days);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

export default function CreateCampaignWizard({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('');
  const [customGoalMode, setCustomGoalMode] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [quick, setQuick] = useState<'' | '7' | '14' | '30'>('');
  const [focusName, setFocusName] = useState('');
  const [focusDesc, setFocusDesc] = useState('');
  const [frequency, setFrequency] = useState<WizardFrequency>('daily');
  const [customPerWeek, setCustomPerWeek] = useState(3);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reset to a clean, lightly pre-filled state every time the wizard opens.
  useEffect(() => {
    if (!open) return;
    const brand = getBrand();
    const start = todayISO();
    setStep(1);
    setGoal('');
    setCustomGoalMode(false);
    setCustomGoal('');
    setPeriodStart(start);
    setPeriodEnd(addDaysISO(start, 29));
    setQuick('30');
    setFocusName((brand && brand.mainService) || '');
    setFocusDesc('');
    setFrequency('daily');
    setCustomPerWeek(3);
    setPlatforms(['Instagram', 'Facebook']);
    setCampaignName('');
    setSubmitting(false);
  }, [open]);

  // Escape to close + body scroll lock while open (mirrors AssignCalendarModal).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const resolvedGoal = customGoalMode ? customGoal.trim() : goal;

  const estimated = useMemo(
    () => estimateCount(periodStart, periodEnd, frequency, customPerWeek),
    [periodStart, periodEnd, frequency, customPerWeek],
  );

  const previewName = buildCampaignName({ campaignName, focusName, goal: resolvedGoal });

  const periodValid =
    !!periodStart && !!periodEnd && periodEnd >= periodStart;

  function stepValid(s: number): boolean {
    if (s === 1) return !!resolvedGoal;
    if (s === 2) return periodValid;
    if (s === 3) return !!focusName.trim();
    if (s === 4) return frequency !== 'custom' || (customPerWeek >= 1 && customPerWeek <= 7);
    if (s === 5) return platforms.length > 0;
    return true;
  }

  if (!open) return null;

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function applyQuick(days: 7 | 14 | 30) {
    const start = periodStart || todayISO();
    setPeriodStart(start);
    setPeriodEnd(addDaysISO(start, days - 1));
    setQuick(String(days) as '7' | '14' | '30');
  }

  function togglePlatform(p: string) {
    setPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function next() {
    if (!stepValid(step)) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  function generate() {
    if (submitting) return;
    if (!resolvedGoal || !periodValid || !focusName.trim() || platforms.length === 0) return;
    setSubmitting(true);
    const input: WizardInput = {
      goal: resolvedGoal,
      periodStart,
      periodEnd,
      focusName: focusName.trim(),
      focusDesc: focusDesc.trim(),
      frequency,
      customPerWeek,
      platforms,
      campaignName: campaignName.trim() || undefined,
    };
    try {
      const plan = buildPlan(getBrand(), input);
      createCampaign(plan.campaign, { calendar: plan.rows, setActive: true });
      toast('Campaign created. Your content plan is ready.');
      onClose();
      router.push('/content-calendar');
    } catch (err) {
      setSubmitting(false);
      toast('Could not create the campaign. Please try again.');
    }
  }

  const STEP_META = [
    { title: 'Campaign goal', sub: 'What is the main goal of this campaign?' },
    { title: 'Campaign period', sub: 'When will this campaign run?' },
    { title: 'Product / service focus', sub: 'What should this campaign focus on?' },
    { title: 'Content frequency', sub: 'How often do you want to post?' },
    { title: 'Platforms', sub: 'Where will you publish this content?' },
    { title: 'Review & generate', sub: 'Check the details, then generate your plan.' },
  ];
  const meta = STEP_META[step - 1];
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const barFillStyle: React.CSSProperties = { width: pct + '%' };

  return (
    <div className="modal-overlay show" onClick={onOverlayClick}>
      <div
        className="modal wizard-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Create campaign"
      >
        <div className="modal-head">
          <div className="mt">
            <span className="wiz-eyebrow">Create Plan</span>
            <h2>{meta.title}</h2>
            <p className="wiz-sub">{meta.sub}</p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        {/* Progress indicator */}
        <div className="wiz-progress">
          <div className="wiz-progress-row">
            <span className="wiz-step-label">
              Step {step} of {TOTAL_STEPS}
            </span>
            <span className="wiz-step-name">{meta.title}</span>
          </div>
          <div className="wiz-bar">
            <div className="wiz-bar-fill" style={barFillStyle} />
          </div>
        </div>

        <div className="modal-body">
          {/* STEP 1 — Goal */}
          {step === 1 ? (
            <div className="wiz-step">
              <div className="wiz-grid">
                {GOALS.map((g) => {
                  const selected = !customGoalMode && goal === g.id;
                  return (
                    <button
                      type="button"
                      key={g.id}
                      className={'wiz-option' + (selected ? ' selected' : '')}
                      onClick={() => {
                        setGoal(g.id);
                        setCustomGoalMode(false);
                      }}
                    >
                      <span className="o-title">{g.label}</span>
                      <span className="o-desc">{g.desc}</span>
                    </button>
                  );
                })}
                <button
                  type="button"
                  className={'wiz-option' + (customGoalMode ? ' selected' : '')}
                  onClick={() => setCustomGoalMode(true)}
                >
                  <span className="o-title">Custom goal</span>
                  <span className="o-desc">Describe your own goal.</span>
                </button>
              </div>
              {customGoalMode ? (
                <div className="field" style={fieldGapStyle}>
                  <label>Custom goal</label>
                  <input
                    type="text"
                    value={customGoal}
                    placeholder="e.g. Re-engage past clients"
                    onChange={(e) => setCustomGoal(e.target.value)}
                    maxLength={48}
                  />
                </div>
              ) : null}
            </div>
          ) : null}

          {/* STEP 2 — Period */}
          {step === 2 ? (
            <div className="wiz-step">
              <div className="wiz-quick">
                {[7, 14, 30].map((d) => (
                  <button
                    type="button"
                    key={d}
                    className={'wiz-chip' + (quick === String(d) ? ' selected' : '')}
                    onClick={() => applyQuick(d as 7 | 14 | 30)}
                  >
                    {d} days
                  </button>
                ))}
              </div>
              <div className="assign-grid">
                <div className="field">
                  <label>
                    Start date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodStart}
                    onChange={(e) => {
                      setPeriodStart(e.target.value);
                      setQuick('');
                    }}
                  />
                </div>
                <div className={'field' + (periodStart && periodEnd && periodEnd < periodStart ? ' invalid' : '')}>
                  <label>
                    End date <span className="req">*</span>
                  </label>
                  <input
                    type="date"
                    value={periodEnd}
                    min={periodStart || undefined}
                    onChange={(e) => {
                      setPeriodEnd(e.target.value);
                      setQuick('');
                    }}
                  />
                  {periodStart && periodEnd && periodEnd < periodStart ? (
                    <p className="hint">End date must be on or after the start date.</p>
                  ) : null}
                </div>
              </div>
              <p className="wiz-note">
                Content is generated for the selected period only — choose 7 days and
                you get 7 days of content, not 30.
              </p>
            </div>
          ) : null}

          {/* STEP 3 — Focus */}
          {step === 3 ? (
            <div className="wiz-step">
              <div className="field">
                <label>
                  Product / service name <span className="req">*</span>
                </label>
                <input
                  type="text"
                  value={focusName}
                  placeholder="e.g. Hydra Peel Facial"
                  onChange={(e) => setFocusName(e.target.value)}
                  maxLength={60}
                />
                <p className="hint">Pre-filled from your business profile. You can override it.</p>
              </div>
              <div className="field" style={fieldGapStyle}>
                <label>Short description (optional)</label>
                <textarea
                  rows={3}
                  value={focusDesc}
                  placeholder="A sentence about what makes this offer special."
                  onChange={(e) => setFocusDesc(e.target.value)}
                  maxLength={240}
                />
              </div>
            </div>
          ) : null}

          {/* STEP 4 — Frequency */}
          {step === 4 ? (
            <div className="wiz-step">
              <div className="wiz-grid">
                {FREQUENCIES.map((f) => {
                  const selected = frequency === f.id;
                  return (
                    <button
                      type="button"
                      key={f.id}
                      className={'wiz-option' + (selected ? ' selected' : '')}
                      onClick={() => setFrequency(f.id)}
                    >
                      <span className="o-title">{f.label}</span>
                      <span className="o-desc">{f.desc}</span>
                    </button>
                  );
                })}
              </div>
              {frequency === 'custom' ? (
                <div className="field" style={customNumStyle}>
                  <label>Posts per week</label>
                  <input
                    type="number"
                    min={1}
                    max={7}
                    value={customPerWeek}
                    onChange={(e) =>
                      setCustomPerWeek(
                        Math.max(1, Math.min(7, parseInt(e.target.value, 10) || 1)),
                      )
                    }
                  />
                  <p className="hint">Between 1 and 7 posts per week.</p>
                </div>
              ) : null}
              <p className="wiz-note">
                Estimated content for this period: <strong>{estimated}</strong>{' '}
                {estimated === 1 ? 'item' : 'items'}.
              </p>
            </div>
          ) : null}

          {/* STEP 5 — Platforms */}
          {step === 5 ? (
            <div className="wiz-step">
              <div className="wiz-grid wiz-grid-tight">
                {PLATFORMS.map((p) => {
                  const selected = platforms.includes(p);
                  return (
                    <button
                      type="button"
                      key={p}
                      className={'wiz-option wiz-option-row' + (selected ? ' selected' : '')}
                      onClick={() => togglePlatform(p)}
                    >
                      <span className="o-title">{p}</span>
                      <span className="o-check">{selected ? '✓' : ''}</span>
                    </button>
                  );
                })}
              </div>
              <p className="wiz-note">Select one or more. You can publish the same plan across channels.</p>
            </div>
          ) : null}

          {/* STEP 6 — Review */}
          {step === 6 ? (
            <div className="wiz-step">
              <div className="field">
                <label>Campaign name</label>
                <input
                  type="text"
                  value={campaignName}
                  placeholder={previewName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  maxLength={80}
                />
                <p className="hint">Leave blank to use the suggested name above.</p>
              </div>
              <div className="wiz-summary">
                <div className="wiz-summary-row">
                  <span className="k">Campaign name</span>
                  <span className="v">{previewName}</span>
                </div>
                <div className="wiz-summary-row">
                  <span className="k">Goal</span>
                  <span className="v">{resolvedGoal || '—'}</span>
                </div>
                <div className="wiz-summary-row">
                  <span className="k">Period</span>
                  <span className="v">
                    {fmtDate(periodStart)} – {fmtDate(periodEnd)}
                  </span>
                </div>
                <div className="wiz-summary-row">
                  <span className="k">Focus</span>
                  <span className="v">{focusName.trim() || '—'}</span>
                </div>
                <div className="wiz-summary-row">
                  <span className="k">Frequency</span>
                  <span className="v">{frequencyLabel(frequency, customPerWeek)}</span>
                </div>
                <div className="wiz-summary-row">
                  <span className="k">Platforms</span>
                  <span className="v">{platforms.join(', ') || '—'}</span>
                </div>
                <div className="wiz-summary-row total">
                  <span className="k">Estimated content</span>
                  <span className="v">
                    {estimated} {estimated === 1 ? 'item' : 'items'}
                  </span>
                </div>
              </div>
              <p className="wiz-note">
                Your content will be tailored to your goal and selected platforms.
              </p>
              <p className="wiz-note">
                Content is added to the Content Planner as <strong>Planning</strong>.
                Nothing is scheduled to the Work Calendar automatically — you choose
                what to schedule later.
              </p>
            </div>
          ) : null}
        </div>

        <div className="modal-foot wiz-foot">
          <Button variant="ghost" size="small" onClick={onClose}>
            Cancel
          </Button>
          <div className="wiz-foot-nav">
            {step > 1 ? (
              <Button variant="ghost" onClick={back} disabled={submitting}>
                Back
              </Button>
            ) : null}
            {step < TOTAL_STEPS ? (
              <Button onClick={next} disabled={!stepValid(step)}>
                Next
              </Button>
            ) : (
              <Button onClick={generate} disabled={submitting || !stepValid(step)}>
                {submitting ? 'Generating…' : 'Generate Content Plan'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
