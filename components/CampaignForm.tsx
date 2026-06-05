'use client';

/*
 * CampaignForm (Rencana Campaign)
 * Ported from renderCampaignSetup() in the prototype.
 * Priority service stays locked to "Facial Treatment" (read-only) for the MVP.
 */
import React, { useEffect, useState } from 'react';
import { defaultCampaign, OBJECTIVES } from '@/data/sampleContent';
import type { Campaign } from '@/types/content';
import { getCampaign, saveCampaign } from '@/lib/storage';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';

const btnRowStyle: React.CSSProperties = { marginTop: 22 };

export default function CampaignForm() {
  const toast = useToast();
  const [c, setC] = useState<Campaign>(defaultCampaign());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setC(getCampaign() || defaultCampaign());
    setMounted(true);
  }, []);

  function set<K extends keyof Campaign>(key: K, v: Campaign[K]) {
    setC((prev) => ({ ...prev, [key]: v }));
  }

  function handleSave() {
    const data: Campaign = {
      campaignName: (c.campaignName || '').trim() || 'Facial Awareness Campaign',
      periodStart: (c.periodStart || '').trim(),
      periodEnd: (c.periodEnd || '').trim(),
      priorityService: 'Facial Treatment',
      campaignGoal: (String(c.campaignGoal) || '').trim() || 'Awareness',
      mainPlatform: (c.mainPlatform || '').trim(),
      postingFrequency: (c.postingFrequency || '').trim(),
      notes: (c.notes || '').trim(),
    };
    saveCampaign(data);
    toast('Rencana campaign tersimpan ✅');
  }

  if (!mounted) return null;

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Langkah 2</span>
        <h1>Rencana Campaign</h1>
        <p>
          Atur campaign awareness pertama untuk Facial Treatment. Periode ini
          dipakai untuk menentukan tanggal di rencana konten 30 hari.
        </p>
      </section>
      <section>
        <div className="card">
          <div className="form-grid">
            <div className="field">
              <label>Nama Campaign</label>
              <input
                type="text"
                value={c.campaignName}
                onChange={(e) => set('campaignName', e.target.value)}
              />
              <p className="hint">Nama campaign bulan ini.</p>
            </div>
            <div className="field">
              <label>Tujuan Campaign</label>
              <select
                value={String(c.campaignGoal)}
                onChange={(e) => set('campaignGoal', e.target.value)}
              >
                {OBJECTIVES.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <p className="hint">Default Awareness untuk bulan pertama.</p>
            </div>
            <div className="field">
              <label>Periode Mulai</label>
              <input
                type="date"
                value={c.periodStart}
                onChange={(e) => set('periodStart', e.target.value)}
              />
              <p className="hint">Tanggal mulai campaign.</p>
            </div>
            <div className="field">
              <label>Periode Selesai</label>
              <input
                type="date"
                value={c.periodEnd}
                onChange={(e) => set('periodEnd', e.target.value)}
              />
              <p className="hint">Tanggal selesai campaign.</p>
            </div>
            <div className="field">
              <label>Layanan Prioritas</label>
              <input type="text" value="Facial Treatment" readOnly />
              <p className="hint">Terkunci pada Facial Treatment untuk MVP ini.</p>
            </div>
            <div className="field">
              <label>Platform Utama</label>
              <input
                type="text"
                value={c.mainPlatform}
                onChange={(e) => set('mainPlatform', e.target.value)}
              />
              <p className="hint">Platform sosial media utama.</p>
            </div>
            <div className="field">
              <label>Frekuensi Posting</label>
              <input
                type="text"
                value={c.postingFrequency}
                onChange={(e) => set('postingFrequency', e.target.value)}
              />
              <p className="hint">Seberapa sering konten diposting.</p>
            </div>
            <div className="field full">
              <label>Catatan</label>
              <textarea
                rows={3}
                value={c.notes}
                onChange={(e) => set('notes', e.target.value)}
              />
              <p className="hint">Fokus dan arahan campaign bulan ini.</p>
            </div>
          </div>
          <div className="btn-row" style={btnRowStyle}>
            <Button onClick={handleSave}>💾 Simpan Rencana Campaign</Button>
            <Button href="/content-calendar" variant="secondary">
              Lanjut ke Rencana Konten →
            </Button>
          </div>
        </div>
      </section>
      <section>
        <Note icon="💬">
          Phase 1 tidak menyertakan field iklan berbayar maupun lead tracking.
          Layanan prioritas dikunci pada <strong>Facial Treatment</strong>.
        </Note>
      </section>
      <Footer />
    </>
  );
}
