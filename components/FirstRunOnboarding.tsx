'use client';

/*
 * FirstRunOnboarding (Phase 1.5A — full-screen first-time setup)
 * A true first-run experience shown ONLY when no brand profile exists yet.
 * It renders full-screen with NO sidebar / dashboard chrome (AppFrame swaps it
 * in for the normal layout). Flow: welcome → brand → campaign → confirm →
 * generate (loading) → hard redirect to /content-calendar.
 *
 * It only reuses existing data + functions:
 *  - BrandOnboarding (embedded) saves the SAME BrandSnapshot
 *  - CampaignOnboarding saves the SAME Campaign
 *  - generateCalendar + saveCalendar produce the SAME 30-day ContentRow[]
 * Nothing in the data model, generator, or core functions is changed.
 */
import React, { useEffect, useState } from 'react';
import { getBrand, getCampaign, saveCalendar } from '@/lib/storage';
import { generateCalendar } from '@/lib/generator';
import BrandOnboarding from './BrandOnboarding';
import CampaignOnboarding from './CampaignOnboarding';
import Button from './Button';

type Phase = 'welcome' | 'brand' | 'campaign' | 'confirm' | 'generating';

const WELCOME_CARDS = [
  { ic: '💄', t: 'Siapkan profil usaha' },
  { ic: '📅', t: 'Buat rencana campaign' },
  { ic: '🗓️', t: 'Dapatkan 30 ide konten siap pakai' },
];

const stepHeadStyle: React.CSSProperties = { textAlign: 'center', marginBottom: 18 };

export default function FirstRunOnboarding() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [bizName, setBizName] = useState('usahamu');

  // When entering the generating phase: build + save the calendar with the
  // existing generator, then redirect to the real Rencana Konten page.
  useEffect(() => {
    if (phase !== 'generating') return;
    const brand = getBrand();
    const campaign = getCampaign();
    const rows = generateCalendar(brand, campaign);
    saveCalendar(rows);
    const timer = setTimeout(() => {
      if (typeof window !== 'undefined') window.location.assign('/content-calendar');
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase]);

  return (
    <div className="fr-screen">
      <div className="fr-wrap">
        <div className="fr-brandbar">
          <span className="fr-logo">✨</span>
          <span className="fr-logo-text">Denana Next OS</span>
        </div>

        {phase === 'welcome' && (
          <div className="fr-center">
            <h1 className="fr-title">Welcome to Denana Next OS</h1>
            <p className="fr-sub">
              Sistem sederhana untuk merencanakan dan mengelola konten sosial media usahamu.
            </p>
            <div className="fr-cards">
              {WELCOME_CARDS.map((c) => (
                <div className="fr-card" key={c.t}>
                  <span className="fr-ic">{c.ic}</span>
                  <span className="fr-t">{c.t}</span>
                </div>
              ))}
            </div>
            <div className="fr-cta">
              <Button onClick={() => setPhase('brand')}>Mulai panduan setup</Button>
            </div>
          </div>
        )}

        {phase === 'brand' && (
          <div>
            <div style={stepHeadStyle}>
              <span className="notion-eyebrow">Langkah 1 dari 3</span>
              <h1 className="fr-title">Siapkan profil usaha</h1>
              <p className="fr-sub">Jawab beberapa pertanyaan singkat. Pilih saja dari saran yang tersedia.</p>
            </div>
            <BrandOnboarding
              embedded
              onComplete={() => {
                const b = getBrand();
                setBizName((b && b.businessName) || 'usahamu');
                setPhase('campaign');
              }}
            />
          </div>
        )}

        {phase === 'campaign' && (
          <div>
            <div style={stepHeadStyle}>
              <span className="notion-eyebrow">Langkah 2 dari 3</span>
              <h1 className="fr-title">Buat rencana campaign</h1>
              <p className="fr-sub">Tentukan momen, tujuan, dan durasi campaign pertamamu.</p>
            </div>
            <CampaignOnboarding onComplete={() => setPhase('confirm')} />
          </div>
        )}

        {phase === 'confirm' && (
          <div className="fr-center">
            <span className="notion-eyebrow">Langkah 3 dari 3</span>
            <div className="card fr-confirm">
              <div className="fr-big">🎉</div>
              <h2>Campaign pertamamu sudah siap</h2>
              <p className="notion-muted">
                Campaign pertamamu sudah siap. Sekarang sistem akan membuat rencana konten.
              </p>
              <div className="fr-cta">
                <Button onClick={() => setPhase('generating')}>Buat rencana konten</Button>
              </div>
            </div>
          </div>
        )}

        {phase === 'generating' && (
          <div className="fr-loading">
            <div className="fr-spinner" />
            <p className="fr-loading-text">
              Sedang menyusun ide konten untuk {bizName}...
            </p>
            <div className="fr-skel-list">
              <div className="fr-skel" />
              <div className="fr-skel" />
              <div className="fr-skel" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
