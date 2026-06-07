'use client';

/*
 * CampaignOnboarding (Phase 1.5B rev — step-by-step campaign wizard)
 * A true 5-step guided wizard: one decision per card, progress bar, back/next
 * navigation, and disabled Continue until the required input is filled.
 *
 * Used in two places:
 *  - FirstRunOnboarding (Phase 1.5A first-time flow)
 *  - CampaignWizardClient (Phase 1.5B returning-user /campaign-setup page)
 *
 * The data contract is unchanged: saveCampaign() writes the SAME Campaign
 * structure; the generator and all core functions are unmodified.
 */
import React, { useState } from 'react';
import type { Campaign, Objective } from '@/types/content';
import { createCampaign } from '@/lib/storage';
import { useToast } from './ToastProvider';
import Button from './Button';

const TOTAL_STEPS = 5;

type Moment = {
  label: string;
  names: string[];
  note: string;
};

const MOMENTS: Moment[] = [
  {
    label: 'Campaign bulanan',
    names: ['Facial Awareness Campaign', 'Fresh Face Campaign', 'Glow Bulanan Campaign'],
    note: 'Campaign rutin bulanan untuk menjaga awareness dan konsistensi konten Facial Treatment.',
  },
  {
    label: 'Ramadhan / Lebaran',
    names: ['Ramadhan Glow Campaign', 'Lebaran Ready Skin Campaign', 'Glow for Lebaran Campaign'],
    note: 'Campaign momen Ramadhan/Lebaran: bantu customer tampil fresh dan percaya diri saat hari raya.',
  },
  {
    label: 'Promo facial',
    names: ['Promo Facial Spesial', 'Fresh Face Promo', 'Facial Deal Campaign'],
    note: 'Campaign promo facial untuk mendorong customer mulai booking treatment.',
  },
  {
    label: 'Edukasi facial',
    names: ['Facial Education Campaign', 'Kenali Facial Campaign', 'Smart Skin Campaign'],
    note: 'Campaign edukasi: menjelaskan manfaat dan proses facial treatment dengan bahasa sederhana.',
  },
  {
    label: 'Bangun kepercayaan customer',
    names: ['Trusted Glow Campaign', 'Cerita Customer Campaign', 'Bukti Hasil Campaign'],
    note: 'Campaign trust building lewat testimoni, cerita customer, dan bukti hasil treatment.',
  },
  {
    label: 'Custom',
    names: [],
    note: 'Campaign khusus sesuai kebutuhanmu bulan ini.',
  },
];

const GOAL_OPTIONS: Array<{ label: string; objective: Objective }> = [
  { label: 'Biar orang tahu Denana', objective: 'Awareness' },
  { label: 'Biar orang paham manfaat facial', objective: 'Engagement' },
  { label: 'Biar orang mulai tanya harga', objective: 'Engagement' },
  { label: 'Biar orang booking treatment', objective: 'Booking' },
  { label: 'Biar customer lama datang lagi', objective: 'Trust' },
];

const DURATIONS = [7, 14, 30];

const headStyle: React.CSSProperties = { marginTop: 0 };
const leadStyle: React.CSSProperties = { marginTop: 0, marginBottom: 14 };
const hintTopStyle: React.CSSProperties = { marginTop: 10 };
const fieldTopStyle: React.CSSProperties = { marginTop: 12 };
const errStyle: React.CSSProperties = {
  color: '#c0561f',
  fontSize: 13,
  marginTop: 14,
  marginBottom: 0,
};
const navRowStyle: React.CSSProperties = { marginTop: 22 };

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function CampaignOnboarding({
  onComplete,
  title = 'Buat campaign pertamamu',
  subtitle = 'Jawab beberapa pertanyaan singkat. Sistem akan bantu susun campaign-mu.',
  submitLabel = 'Simpan campaign ✅',
}: {
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
}) {
  const toast = useToast();

  const [step, setStep] = useState(1);
  const [moment, setMoment] = useState<string>(MOMENTS[0].label);
  const [goal, setGoal] = useState<string>(GOAL_OPTIONS[0].label);
  const [duration, setDuration] = useState<number>(30);
  const [campaignName, setCampaignName] = useState<string>(MOMENTS[0].names[0]);
  const [nameEdited, setNameEdited] = useState(false);
  const [err, setErr] = useState('');

  const current = MOMENTS.find((m) => m.label === moment) || MOMENTS[0];

  // Review date display — computed at render time for step 5.
  const reviewStart = new Date();
  const reviewEnd = new Date();
  reviewEnd.setDate(reviewEnd.getDate() + (duration - 1));
  const reviewPeriodStart = toISO(reviewStart);
  const reviewPeriodEnd = toISO(reviewEnd);

  function pickMoment(label: string) {
    setMoment(label);
    const m = MOMENTS.find((x) => x.label === label) || MOMENTS[0];
    if (!nameEdited) setCampaignName(m.names[0] || '');
  }

  function finish() {
    setErr('');
    const name = (campaignName || '').trim();
    if (!name) {
      setErr('Isi nama campaign-nya dulu ya.');
      return;
    }
    const goalObjective = (GOAL_OPTIONS.find((g) => g.label === goal) || GOAL_OPTIONS[0]).objective;
    const start = new Date();
    const end = new Date();
    end.setDate(end.getDate() + (duration - 1));
    const data: Campaign = {
      campaignName: name,
      periodStart: toISO(start),
      periodEnd: toISO(end),
      priorityService: 'Facial Treatment',
      campaignGoal: goalObjective,
      mainPlatform: 'Instagram dan Facebook',
      postingFrequency: '1 konten per hari selama ' + duration + ' hari',
      notes: current.note,
    };
    // Create a NEW campaign record (never overwrite previous campaigns). The
    // record is set active here because this is the user's explicit save on
    // the final wizard step.
    createCampaign(data, { setActive: true });
    toast('Rencana campaign tersimpan ✅');
    onComplete();
  }

  function next() {
    setErr('');
    if (step === 4 && !campaignName.trim()) {
      setErr('Isi nama campaign-nya dulu ya.');
      return;
    }
    if (step === TOTAL_STEPS) {
      finish();
      return;
    }
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  function back() {
    setErr('');
    setStep((s) => Math.max(1, s - 1));
    if (typeof window !== 'undefined') window.scrollTo(0, 0);
  }

  const continueDisabled = step === 4 && !campaignName.trim();
  const isLastStep = step === TOTAL_STEPS;
  const pct = Math.round((step / TOTAL_STEPS) * 100);
  const barFillStyle: React.CSSProperties = { width: pct + '%' };

  return (
    <section className="ob-wizard-wrap">
      <div className="card">
        {/* Progress indicator */}
        <div className="ob-progress">
          <div className="ob-bar">
            <div className="ob-bar-fill" style={barFillStyle} />
          </div>
          <span className="ob-progress-label">Langkah {step} dari {TOTAL_STEPS}</span>
        </div>

        {/* ---- Step 1: Momen ---- */}
        {step === 1 && (
          <div>
            <h3 style={headStyle}>Kapan campaign ini akan dijalankan?</h3>
            <p className="notion-muted" style={leadStyle}>Pilih momen yang paling sesuai.</p>
            <div className="ob-option-grid">
              {MOMENTS.map((m) => {
                const on = moment === m.label;
                return (
                  <button
                    type="button"
                    key={m.label}
                    className={'ob-option-card' + (on ? ' on' : '')}
                    onClick={() => pickMoment(m.label)}
                  >
                    <div className="ob-option-label">
                      {on ? <span className="ob-check">✓</span> : null}
                      {m.label}
                    </div>
                    {m.label !== 'Custom' && (
                      <div className="ob-option-hint">
                        {m.label === 'Campaign bulanan' && 'Konsistensi awareness'}
                        {m.label === 'Ramadhan / Lebaran' && 'Momen musiman'}
                        {m.label === 'Promo facial' && 'Mendorong booking'}
                        {m.label === 'Edukasi facial' && 'Penjelasan treatment'}
                        {m.label === 'Bangun kepercayaan customer' && 'Testimoni & rasa percaya'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Step 2: Tujuan ---- */}
        {step === 2 && (
          <div>
            <h3 style={headStyle}>Apa tujuan utama campaign ini?</h3>
            <p className="notion-muted" style={leadStyle}>Pilih yang paling menggambarkan harapanmu.</p>
            <div className="ob-option-grid">
              {GOAL_OPTIONS.map((g) => {
                const on = goal === g.label;
                return (
                  <button
                    type="button"
                    key={g.label}
                    className={'ob-option-card' + (on ? ' on' : '')}
                    onClick={() => setGoal(g.label)}
                  >
                    <div className="ob-option-label">
                      {on ? <span className="ob-check">✓</span> : null}
                      {g.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Step 3: Durasi ---- */}
        {step === 3 && (
          <div>
            <h3 style={headStyle}>Berapa lama campaign ini berjalan?</h3>
            <p className="notion-muted" style={leadStyle}>
              Durasi ini menentukan periode dan frekuensi kontenmu.
            </p>
            <div className="ob-option-grid ob-option-grid-compact">
              {DURATIONS.map((d) => {
                const on = duration === d;
                return (
                  <button
                    type="button"
                    key={d}
                    className={'ob-option-card' + (on ? ' on' : '')}
                    onClick={() => setDuration(d)}
                  >
                    <div className="ob-option-label">
                      {on ? <span className="ob-check">✓</span> : null}
                      {d} hari
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="hint" style={hintTopStyle}>
              Untuk campaign bulanan, 30 hari biasanya paling ideal.
            </p>
          </div>
        )}

        {/* ---- Step 4: Nama campaign ---- */}
        {step === 4 && (
          <div>
            <h3 style={headStyle}>Beri nama campaign ini</h3>
            <p className="notion-muted" style={leadStyle}>
              Pilih saran di bawah atau tulis nama sendiri.
            </p>
            {current.names.length > 0 ? (
              <div className="ob-option-grid">
                {current.names.map((n) => (
                  <button
                    type="button"
                    key={n}
                    className={'ob-option-card' + (campaignName === n ? ' on' : '')}
                    onClick={() => {
                      setCampaignName(n);
                      setNameEdited(true);
                    }}
                  >
                    <div className="ob-option-label">
                      {campaignName === n ? <span className="ob-check">✓</span> : null}
                      {n}
                    </div>
                  </button>
                ))}
              </div>
            ) : null}
            <div className="field full" style={fieldTopStyle}>
              <input
                type="text"
                value={campaignName}
                onChange={(e) => {
                  setCampaignName(e.target.value);
                  setNameEdited(true);
                }}
                placeholder="Contoh: Facial Awareness Campaign"
              />
              {current.names.length > 0 ? (
                <p className="hint">Pilih salah satu saran di atas atau tulis nama sendiri.</p>
              ) : (
                <p className="hint">Tulis nama campaign yang kamu inginkan.</p>
              )}
            </div>
          </div>
        )}

        {/* ---- Step 5: Review sebelum disimpan ---- */}
        {step === 5 && (
          <div>
            <h3 style={headStyle}>Cek dulu sebelum disimpan</h3>
            <p className="notion-muted" style={leadStyle}>Pastikan semua sudah sesuai.</p>
            <div className="ob-review">
              <div>
                <span>Nama campaign</span>
                <strong>{(campaignName || '').trim() || '(belum diisi)'}</strong>
              </div>
              <div>
                <span>Momen</span>
                <strong>{moment}</strong>
              </div>
              <div>
                <span>Tujuan</span>
                <strong>{goal}</strong>
              </div>
              <div>
                <span>Durasi</span>
                <strong>{duration} hari</strong>
              </div>
              <div>
                <span>Periode</span>
                <strong>{reviewPeriodStart} – {reviewPeriodEnd}</strong>
              </div>
              <div>
                <span>Frekuensi posting</span>
                <strong>1 konten/hari selama {duration} hari</strong>
              </div>
            </div>
          </div>
        )}

        {err ? <p style={errStyle}>{err}</p> : null}

        {/* Navigation */}
        <div className="btn-row" style={navRowStyle}>
          {step > 1 ? (
            <Button variant="ghost" onClick={back}>
              ← Kembali
            </Button>
          ) : null}
          <Button onClick={next} disabled={continueDisabled}>
            {isLastStep ? submitLabel : 'Lanjut →'}
          </Button>
        </div>
      </div>
    </section>
  );
}
