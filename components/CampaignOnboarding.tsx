'use client';

/*
 * CampaignOnboarding (Phase 1.5A — Guided first campaign)
 * A focused, friendly campaign setup used inside the full-screen first-run flow.
 * It maps simple choices (moment / goal / duration) onto the SAME Campaign
 * localStorage structure the dashboard already uses — it does not change the
 * Campaign data model, the generator, or any core function.
 */
import React, { useState } from 'react';
import type { Campaign, Objective } from '@/types/content';
import { saveCampaign } from '@/lib/storage';
import { useToast } from './ToastProvider';
import Button from './Button';

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
const errStyle: React.CSSProperties = { color: '#c0561f', fontSize: 13, marginTop: 14, marginBottom: 0 };
const navRowStyle: React.CSSProperties = { marginTop: 22 };
const nameFieldStyle: React.CSSProperties = { marginTop: 4 };

function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function CampaignOnboarding({
  onComplete,
  title = 'Buat campaign pertamamu',
  subtitle = 'Pilih saja yang paling cocok. Ini menentukan arah 30 ide konten yang akan dibuat.',
  submitLabel = 'Simpan campaign →',
}: {
  onComplete: () => void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
}) {
  const toast = useToast();
  const [moment, setMoment] = useState<string>(MOMENTS[0].label);
  const [goal, setGoal] = useState<string>(GOAL_OPTIONS[0].label);
  const [duration, setDuration] = useState<number>(30);
  const [campaignName, setCampaignName] = useState<string>(MOMENTS[0].names[0]);
  const [nameEdited, setNameEdited] = useState(false);
  const [err, setErr] = useState('');

  const current = MOMENTS.find((m) => m.label === moment) || MOMENTS[0];

  // Live "review ringkas" values (also exactly what finish() will persist).
  const reviewStart = new Date();
  const reviewEnd = new Date();
  reviewEnd.setDate(reviewEnd.getDate() + (duration - 1));
  const periodStart = toISO(reviewStart);
  const periodEnd = toISO(reviewEnd);
  const reviewName = (campaignName || '').trim() || '(belum diisi)';
  const reviewGoal = (GOAL_OPTIONS.find((g) => g.label === goal) || GOAL_OPTIONS[0]).label;

  function pickMoment(label: string) {
    setMoment(label);
    const m = MOMENTS.find((x) => x.label === label) || MOMENTS[0];
    if (!nameEdited) setCampaignName(m.names[0] || '');
  }

  function finish() {
    setErr('');
    const name = (campaignName || '').trim();
    if (!name) {
      setErr('Beri nama campaign-nya dulu ya.');
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
    saveCampaign(data);
    toast('Rencana campaign tersimpan ✅');
    onComplete();
  }

  return (
    <section>
      <div className="card">
        <h3 style={headStyle}>{title}</h3>
        <p className="notion-muted" style={leadStyle}>{subtitle}</p>

        <div className="ob-group">
          <h4>Momen campaign</h4>
          <div className="ob-choices">
            {MOMENTS.map((m) => (
              <button
                type="button"
                key={m.label}
                className={'ob-choice' + (moment === m.label ? ' on' : '')}
                onClick={() => pickMoment(m.label)}
              >
                {moment === m.label ? <span className="ob-check">✓</span> : null}
                {m.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ob-group">
          <h4>Tujuan campaign</h4>
          <div className="ob-choices">
            {GOAL_OPTIONS.map((g) => (
              <button
                type="button"
                key={g.label}
                className={'ob-choice' + (goal === g.label ? ' on' : '')}
                onClick={() => setGoal(g.label)}
              >
                {goal === g.label ? <span className="ob-check">✓</span> : null}
                {g.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ob-group">
          <h4>Durasi</h4>
          <div className="ob-choices">
            {DURATIONS.map((d) => (
              <button
                type="button"
                key={d}
                className={'ob-choice' + (duration === d ? ' on' : '')}
                onClick={() => setDuration(d)}
              >
                {duration === d ? <span className="ob-check">✓</span> : null}
                {d} hari
              </button>
            ))}
          </div>
          <p className="hint">Rencana konten tetap berisi 30 ide siap pakai.</p>
        </div>

        <div className="ob-group">
          <h4>Nama campaign</h4>
          {current.names.length > 0 ? (
            <div className="ob-choices">
              {current.names.map((n) => (
                <button
                  type="button"
                  key={n}
                  className={'ob-choice' + (campaignName === n ? ' on' : '')}
                  onClick={() => {
                    setCampaignName(n);
                    setNameEdited(true);
                  }}
                >
                  {campaignName === n ? <span className="ob-check">✓</span> : null}
                  {n}
                </button>
              ))}
            </div>
          ) : null}
          <div className="field full" style={nameFieldStyle}>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => {
                setCampaignName(e.target.value);
                setNameEdited(true);
              }}
              placeholder="Contoh: Facial Awareness Campaign"
            />
            <p className="hint">Pilih salah satu saran di atas atau tulis nama sendiri.</p>
          </div>
        </div>

        <div className="ob-group">
          <h4>Review ringkas</h4>
          <div className="ob-review">
            <div><span>Nama</span><strong>{reviewName}</strong></div>
            <div><span>Momen</span><strong>{moment}</strong></div>
            <div><span>Tujuan</span><strong>{reviewGoal}</strong></div>
            <div><span>Durasi</span><strong>{duration} hari ({periodStart} – {periodEnd})</strong></div>
            <div><span>Posting</span><strong>1 konten per hari selama {duration} hari</strong></div>
          </div>
        </div>

        {err ? <p style={errStyle}>{err}</p> : null}

        <div className="btn-row" style={navRowStyle}>
          <Button onClick={finish}>{submitLabel}</Button>
        </div>
      </div>
    </section>
  );
}
