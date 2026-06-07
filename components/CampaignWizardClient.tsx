'use client';

/*
 * CampaignWizardClient (Phase 1.5B — guided campaign for returning users)
 * Default experience on the Rencana Campaign page. Reuses the SAME
 * CampaignOnboarding wizard (and therefore the same Campaign localStorage
 * structure) used by the first-run flow, then adds a returning-user
 * "next step" confirmation that can immediately generate the content plan
 * with the EXISTING generator + saveCalendar.
 *
 * The original long form (CampaignForm) is still available under
 * "Edit detail manual" — nothing is removed, the data model is unchanged, and
 * no core function (generator/edit/copy/export/detail/draft) is touched.
 */
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getBrand, getCampaign, saveCalendar } from '@/lib/storage';
import { generateCalendar } from '@/lib/generator';
import CampaignOnboarding from './CampaignOnboarding';
import CampaignForm from './CampaignForm';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';

type Phase = 'wizard' | 'saved' | 'generating';

const confirmBtnRow: React.CSSProperties = { marginTop: 18 };
const manualRow: React.CSSProperties = { marginTop: 14, textAlign: 'center' };
const backRow: React.CSSProperties = { marginTop: 18 };

export default function CampaignWizardClient() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [manual, setManual] = useState(false);
  const [phase, setPhase] = useState<Phase>('wizard');

  useEffect(() => {
    setMounted(true);
  }, []);

  // When entering the generating phase: build + save the calendar with the
  // existing generator, then go to the real Rencana Konten page.
  useEffect(() => {
    if (phase !== 'generating') return;
    const rows = generateCalendar(getBrand(), getCampaign());
    saveCalendar(rows);
    const timer = setTimeout(() => {
      router.push('/content-calendar');
    }, 1500);
    return () => clearTimeout(timer);
  }, [phase, router]);

  if (!mounted) return null;

  /* ---------- Manual edit (advanced) ---------- */
  if (manual) {
    return (
      <>
        <CampaignForm />
        <section>
          <div className="btn-row" style={backRow}>
            <Button variant="ghost" onClick={() => setManual(false)}>
              ← Kembali ke panduan
            </Button>
          </div>
        </section>
      </>
    );
  }

  /* ---------- Generating (loading / skeleton) ---------- */
  if (phase === 'generating') {
    return (
      <section>
        <div className="card">
          <div className="fr-loading">
            <div className="fr-spinner" />
            <p className="fr-loading-text">Sedang menyusun ide konten untuk campaign ini...</p>
            <div className="fr-skel-list">
              <div className="fr-skel" />
              <div className="fr-skel" />
              <div className="fr-skel" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ---------- Saved — next-step confirmation ---------- */
  if (phase === 'saved') {
    return (
      <>
        <section className="page-head">
          <span className="notion-eyebrow">Rencana Campaign</span>
          <h1>Campaign tersimpan</h1>
        </section>
        <section>
          <div className="card">
            <div className="ob-success">
              <div className="big">🎉</div>
              <h2>Campaign berhasil disimpan</h2>
              <p className="notion-muted">
                Campaign berhasil disimpan. Mau langsung buat rencana konten?
              </p>
              <div className="btn-row" style={confirmBtnRow}>
                <Button onClick={() => setPhase('generating')}>Ya, buat rencana konten</Button>
                <Button variant="ghost" onClick={() => router.push('/')}>
                  Nanti dulu
                </Button>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </>
    );
  }

  /* ---------- Default: guided wizard ---------- */
  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Rencana Campaign</span>
        <h1>Buat campaign baru</h1>
        <p>
          Susun campaign lewat panduan singkat. Pilih saja dari saran yang tersedia —
          semua tetap bisa kamu ubah sebelum disimpan.
        </p>
      </section>

      <CampaignOnboarding
        title="Atur campaign"
        subtitle="Pilih momen, tujuan, dan durasi. Ini menentukan arah 30 ide konten yang akan dibuat."
        submitLabel="Simpan campaign →"
        onComplete={() => {
          setPhase('saved');
          if (typeof window !== 'undefined') window.scrollTo(0, 0);
        }}
      />

      <section>
        <div style={manualRow}>
          <Button variant="ghost" size="tiny" onClick={() => setManual(true)}>
            Edit detail manual (pengaturan lanjutan)
          </Button>
        </div>
      </section>

      <section>
        <Note icon="💡">
          Campaign disimpan ke struktur yang sama seperti sebelumnya, jadi rencana konten
          dan semua tools tetap berjalan normal. Butuh kontrol penuh? Gunakan{' '}
          <strong>Edit detail manual</strong>.
        </Note>
      </section>

      <Footer />
    </>
  );
}
