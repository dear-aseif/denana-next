'use client';

/*
 * DetailModal (Buat Caption & Script)
 * Ported from openDetail() in the prototype. Generates (or loads a saved draft
 * of) the full content detail: caption, short caption, video script, visual
 * direction, overlay options, hashtags, and production checklist.
 * Supports copy actions, "Buat Ulang" (regenerate), and "Simpan Draft".
 */
import React, { useEffect, useMemo, useState } from 'react';
import type { BrandSnapshot, ContentDetail, ContentRow } from '@/types/content';
import { pillarShort } from '@/data/sampleContent';
import { generateDetail, detailTexts } from '@/lib/generator';
import { fmtDate, fmtDateTime } from '@/lib/utils';
import { getDraft, putDraft } from '@/lib/storage';
import { copyText } from '@/lib/exportUtils';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';

const noteTopStyle: React.CSSProperties = { marginTop: 6 };
const bannerStyle: React.CSSProperties = { margin: '0 0 16px' };
const h2Style: React.CSSProperties = { marginTop: 8 };
const scriptBoxStyle: React.CSSProperties = { whiteSpace: 'normal' };

function isValidDetail(d: ContentDetail | null | undefined): d is ContentDetail {
  return !!(
    d &&
    d.script &&
    Array.isArray(d.script.sceneByScene) &&
    Array.isArray(d.hashtags) &&
    Array.isArray(d.overlayOptions) &&
    Array.isArray(d.checklist)
  );
}

function Section({
  n,
  icon,
  title,
  copyValue,
  label,
  children,
}: {
  n: number;
  icon: string;
  title: string;
  copyValue: string;
  label: string;
  children: React.ReactNode;
}) {
  const toast = useToast();
  return (
    <div className="detail-block">
      <div className="dh">
        <span className="sec-num">{n}</span>
        <span className="sec-ico">{icon}</span>
        <h3>{title}</h3>
        <Button
          variant="ghost"
          size="tiny"
          className="copy-btn"
          onClick={() => copyText(copyValue, label, toast)}
        >
          Copy
        </Button>
      </div>
      {children}
    </div>
  );
}

export default function DetailModal({
  row,
  brand,
  onClose,
  onStatusChange,
  onDraftSaved,
}: {
  row: ContentRow;
  brand: BrandSnapshot;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDraftSaved: () => void;
}) {
  const toast = useToast();
  const existingDraft = useMemo(() => getDraft(row.id), [row.id]);
  const [fromDraft, setFromDraft] = useState<boolean>(!!existingDraft);
  const [savedAt, setSavedAt] = useState<string | undefined>(existingDraft?.savedAt);
  const [detail, setDetail] = useState<ContentDetail>(() => {
    const initial = existingDraft ? existingDraft.detail : generateDetail(row, brand);
    return isValidDetail(initial) ? initial : generateDetail(row, brand);
  });

  useEffect(() => {
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
  }, [onClose]);

  const t = detailTexts(detail);

  function handleRegen() {
    if (
      window.confirm(
        'Buat ulang konten dari ide ini? Draft yang tersimpan tidak berubah sampai kamu menekan Simpan Draft.',
      )
    ) {
      setDetail(generateDetail(row, brand));
      setFromDraft(false);
      toast('Konten dibuat ulang');
    }
  }

  function handleSaveDraft() {
    putDraft(row.id, {
      id: row.id,
      savedAt: new Date().toISOString(),
      topicTitle: row.topicTitle,
      pillar: row.pillar,
      format: row.format,
      detail,
    });
    setFromDraft(true);
    setSavedAt(new Date().toISOString());
    toast('Draft konten tersimpan 💾');
    onDraftSaved();
    if (row.productionStatus === 'Idea') {
      if (
        window.confirm(
          'Draft sudah tersimpan. Ubah status produksi konten ini dari "Idea" menjadi "Planned"?',
        )
      ) {
        onStatusChange(row.id, 'Planned');
        toast('Status diubah ke Planned');
      }
    }
  }

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="modal-overlay show" onClick={onOverlayClick}>
      <div className="modal">
        <div className="modal-head">
          <div className="mt">
            <span className={'pill pill-' + pillarShort(row.pillar)}>{row.pillar}</span>
            <h2 style={h2Style}>{row.topicTitle}</h2>
            <div className="meta">
              {fmtDate(row.date)} · {row.day} · {row.format} · {row.objective} · Status:{' '}
              {row.productionStatus}
            </div>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Tutup">
            ×
          </button>
        </div>
        <div className="modal-body">
          {fromDraft ? (
            <Note icon="✅" tone="saved" style={bannerStyle}>
              <strong>Draft tersimpan.</strong> Kamu sedang melihat versi yang sudah
              disimpan{savedAt ? ' (' + fmtDateTime(savedAt) + ')' : ''}. Tekan{' '}
              <em>Buat Ulang</em> untuk versi baru.
            </Note>
          ) : null}

          <Section n={1} icon="📝" title="Caption" copyValue={detail.caption} label="Caption">
            <div className="detail-box">{detail.caption}</div>
          </Section>
          <Section
            n={2}
            icon="⚡"
            title="Caption Singkat"
            copyValue={detail.shortCaption}
            label="Caption singkat"
          >
            <div className="detail-box">{detail.shortCaption}</div>
          </Section>
          <Section
            n={3}
            icon="🎥"
            title="Panduan Video (Reels / Facebook)"
            copyValue={t.script}
            label="Script"
          >
            <div className="detail-box" style={scriptBoxStyle}>
              {detail.script.sceneByScene.map((s, i) => (
                <div className="script-step" key={i}>
                  <div className="t">{s.time}</div>
                  <div>
                    <div className="vo">🎤 {s.voiceover}</div>
                    <div className="ov">🎬 {s.visual}</div>
                    <div className="ov">📝 Overlay: {s.overlayText}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>
          <Section
            n={4}
            icon="🎨"
            title="Arahan Visual"
            copyValue={detail.visualDirection}
            label="Arahan visual"
          >
            <div className="detail-box">{detail.visualDirection}</div>
          </Section>
          <Section
            n={5}
            icon="🔤"
            title="Pilihan Teks Overlay"
            copyValue={detail.overlayOptions.join('\n')}
            label="Overlay text"
          >
            <ul className="chk">
              {detail.overlayOptions.map((o, i) => (
                <li key={i}>{o}</li>
              ))}
            </ul>
          </Section>
          <Section
            n={6}
            icon="#️⃣"
            title="Hashtags"
            copyValue={t.hashtags}
            label="Hashtags"
          >
            <div className="tag-list">
              {detail.hashtags.map((x, i) => (
                <span className="tag" key={i}>
                  {x}
                </span>
              ))}
            </div>
          </Section>
          <Section
            n={7}
            icon="✅"
            title="Checklist Sebelum Posting"
            copyValue={detail.checklist.map((c) => '- ' + c).join('\n')}
            label="Checklist posting"
          >
            <ul className="chk">
              {detail.checklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          <Note icon="⚠️" style={noteTopStyle}>
            Konten dibuat otomatis sebagai draft. Tinjau dulu sebelum diposting.
            Hindari klaim medis &amp; janji hasil pasti — “hasil dapat berbeda pada
            setiap orang”.
          </Note>
        </div>
        <div className="modal-foot">
          <div className="copy-bar">
            <Button variant="ghost" size="small" onClick={() => copyText(detail.caption, 'Caption', toast)}>
              📋 Copy Caption
            </Button>
            <Button variant="ghost" size="small" onClick={() => copyText(t.script, 'Script', toast)}>
              📋 Copy Script
            </Button>
            <Button variant="ghost" size="small" onClick={() => copyText(t.hashtags, 'Hashtags', toast)}>
              📋 Copy Hashtags
            </Button>
            <Button variant="secondary" size="small" onClick={() => copyText(t.full, 'Semua detail konten', toast)}>
              📋 Copy Semua
            </Button>
          </div>
          <div className="foot-main">
            {fromDraft ? (
              <Button variant="ghost" size="small" onClick={handleRegen}>
                ↻ Buat Ulang
              </Button>
            ) : null}
            <Button onClick={handleSaveDraft}>💾 Simpan Draft Konten</Button>
            <Button variant="ghost" size="small" onClick={onClose}>
              Selesai
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
