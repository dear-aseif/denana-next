'use client';

/*
 * ContentPlanner (Rencana Konten)
 * Top-level orchestrator for the Content Plan page. Ported from
 * renderContentCalendar() + its handlers in the prototype.
 *
 * Responsibilities:
 *  - Flow guard: requires a saved Brand + Campaign (else redirect like prototype)
 *  - Generate / regenerate the 30-day calendar (mock engine, no real AI)
 *  - Filter by pillar / format
 *  - Inline-edit rows and persist to localStorage
 *  - Copy row, Copy all, Export CSV (placeholder-friendly, real CSV download)
 *  - Open the DetailModal to build captions/scripts and save drafts
 */
import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BrandSnapshot, Campaign, ContentRow } from '@/types/content';
import { PILLARS, FORMATS } from '@/data/sampleContent';
import {
  getBrand,
  getCampaign,
  getCalendar,
  saveCalendar,
  getDrafts,
  draftCount,
} from '@/lib/storage';
import { generateCalendar } from '@/lib/generator';
import { exportCSV, calendarToText, copyText } from '@/lib/exportUtils';
import { fmtDate } from '@/lib/utils';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';
import EmptyState from './EmptyState';
import CalendarView from './CalendarView';
import DetailModal from './DetailModal';

const spacerStyle: React.CSSProperties = { flex: 1 };
const countStyle: React.CSSProperties = { color: 'var(--notion-text-soft)', fontSize: 13 };
const filterSelectStyle: React.CSSProperties = { maxWidth: 180 };
const noteTopStyle: React.CSSProperties = { marginTop: 18 };

export default function ContentPlanner() {
  const router = useRouter();
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [brand, setBrand] = useState<BrandSnapshot | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [draftIds, setDraftIds] = useState<Record<string, boolean>>({});
  const [fPillar, setFPillar] = useState('');
  const [fFormat, setFFormat] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);

  function refreshDraftIds() {
    const drafts = getDrafts();
    const map: Record<string, boolean> = {};
    Object.keys(drafts).forEach((k) => {
      map[k] = true;
    });
    setDraftIds(map);
  }

  useEffect(() => {
    const b = getBrand();
    const c = getCampaign();
    setBrand(b);
    setCampaign(c);
    setRows(getCalendar());
    refreshDraftIds();
    setMounted(true);

    // Flow guard mirrors the prototype's redirect behavior.
    if (!b) {
      toast('Lengkapi Profil Brand dulu sebelum membuat rencana konten.');
      router.replace('/brand-setup');
    } else if (!c) {
      toast('Buat Rencana Campaign dulu sebelum membuat rencana konten.');
      router.replace('/campaign-setup');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (fPillar && r.pillar !== fPillar) return false;
      if (fFormat && r.format !== fFormat) return false;
      return true;
    });
  }, [rows, fPillar, fFormat]);

  function persist(next: ContentRow[]) {
    setRows(next);
    saveCalendar(next);
  }

  function handleField(id: string, key: keyof ContentRow, value: string) {
    const next = rows.map((r) => (r.id === id ? { ...r, [key]: value } : r));
    persist(next);
  }

  function doGenerate() {
    if (!brand) {
      toast('Lengkapi Profil Brand dulu.');
      router.replace('/brand-setup');
      return;
    }
    if (!campaign) {
      toast('Buat Rencana Campaign dulu.');
      router.replace('/campaign-setup');
      return;
    }
    const next = generateCalendar(brand, campaign);
    persist(next);
    toast(next.length + ' konten berhasil dibuat ✨');
  }

  function regenCal() {
    if (
      window.confirm(
        'Buat ulang seluruh rencana konten? Draft caption yang sudah tersimpan tidak ikut terhapus, tapi daftar konten akan diganti baru.',
      )
    ) {
      doGenerate();
    }
  }

  function copyCal() {
    if (!rows.length) return;
    copyText(calendarToText(rows), 'Rencana konten', toast);
  }

  function csvCal() {
    if (!rows.length) return;
    exportCSV(rows, toast);
  }

  function copyRow(id: string) {
    const r = rows.find((x) => x.id === id);
    if (!r) return;
    const text =
      fmtDate(r.date) +
      ' (' +
      r.day +
      ') — ' +
      r.format +
      ' — ' +
      r.pillar +
      '\nTopik: ' +
      r.topicTitle +
      '\nHook: ' +
      r.hook +
      '\nCTA: ' +
      r.cta +
      '\nObjective: ' +
      r.objective +
      ' | Status: ' +
      r.productionStatus;
    copyText(text, 'Konten', toast);
  }

  function handleStatusChange(id: string, status: string) {
    handleField(id, 'productionStatus', status);
  }

  if (!mounted) return null;

  const openRow = openId ? rows.find((r) => r.id === openId) || null : null;
  const counts =
    filtered.length +
    ' / ' +
    rows.length +
    ' konten · ' +
    draftCount() +
    ' draft tersimpan';

  return (
    <>
      <section className="page-head">
        <span className="notion-eyebrow">Langkah 3</span>
        <h1>Rencana Konten</h1>
        <p>
          Rencana konten 30 hari untuk Facial Treatment. Edit langsung di tabel,
          buat caption &amp; script per konten, lalu simpan sebagai draft.
        </p>
      </section>

      {rows.length === 0 ? (
        <section>
          <div className="card">
            <EmptyState
              big="🗓️"
              title="Belum ada rencana konten"
              action={<Button onClick={doGenerate}>✨ Buat Rencana Konten 30 Hari</Button>}
            >
              Buat rencana konten 30 hari otomatis berdasarkan Profil Brand dan
              Rencana Campaign yang sudah kamu simpan.
            </EmptyState>
          </div>
        </section>
      ) : (
        <>
          <section>
            <div className="toolbar">
              <select
                className="cell-select"
                style={filterSelectStyle}
                value={fPillar}
                onChange={(e) => setFPillar(e.target.value)}
              >
                <option value="">Semua Pilar</option>
                {PILLARS.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
              <select
                className="cell-select"
                style={filterSelectStyle}
                value={fFormat}
                onChange={(e) => setFFormat(e.target.value)}
              >
                <option value="">Semua Format</option>
                {FORMATS.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </select>
              <span style={countStyle}>{counts}</span>
              <span className="spacer" style={spacerStyle} />
              <Button variant="ghost" size="small" onClick={copyCal}>
                📋 Copy
              </Button>
              <Button variant="secondary" size="small" onClick={csvCal}>
                ⬇️ Export CSV
              </Button>
              <Button variant="ghost" size="small" onClick={regenCal}>
                ↻ Buat Ulang
              </Button>
            </div>
          </section>

          <section>
            <CalendarView
              rows={filtered}
              draftIds={draftIds}
              onField={handleField}
              onDetail={(id) => setOpenId(id)}
              onCopy={copyRow}
            />
          </section>

          <section>
            <Note icon="✏️" style={noteTopStyle}>
              Semua kolom bisa diedit langsung. Perubahan tersimpan otomatis di
              browser ini. Tekan <strong>Buat</strong> untuk membuat caption &amp;
              script, lalu simpan sebagai draft.
            </Note>
          </section>
        </>
      )}

      <Footer />

      {openRow && brand ? (
        <DetailModal
          row={openRow}
          brand={brand}
          onClose={() => setOpenId(null)}
          onStatusChange={handleStatusChange}
          onDraftSaved={refreshDraftIds}
        />
      ) : null}
    </>
  );
}
