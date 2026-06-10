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
import { getDraft, putDraft, getCampaigns, getActiveCampaignRecord } from '@/lib/storage';
import { copyText } from '@/lib/exportUtils';
import { getContentStatusLabel, normalizeContentStatus } from '@/lib/labels';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import StatusBadge from './StatusBadge';

const noteTopStyle: React.CSSProperties = { marginTop: 6 };
const bannerStyle: React.CSSProperties = { margin: '0 0 16px' };
const h2Style: React.CSSProperties = { marginTop: 8 };
const scriptBoxStyle: React.CSSProperties = { whiteSpace: 'normal' };
const genUsingStyle: React.CSSProperties = { marginTop: 4, fontSize: 12, opacity: 0.7 };

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
  onRequestAssign,
}: {
  row: ContentRow;
  brand: BrandSnapshot;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
  onDraftSaved: () => void;
  onRequestAssign?: (id: string) => void;
}) {
  const toast = useToast();
  const existingDraft = useMemo(() => getDraft(row.id), [row.id]);
  // Phase 16I: resolve the campaign behind this row (by campaignId, else the
  // active campaign) so caption/script can be goal/platform/focus aware. When no
  // campaign metadata is available, detailOpts is undefined and generateDetail
  // safely falls back to its generic output.
  const detailOpts = useMemo(() => {
    const recs = getCampaigns();
    let rec = row.campaignId ? recs.find((r) => r.id === row.campaignId) : undefined;
    if (!rec) rec = getActiveCampaignRecord() || undefined;
    const c = rec ? rec.campaign : null;
    if (!c) return undefined;
    const platforms = c.mainPlatform
      ? c.mainPlatform.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const goal = typeof c.campaignGoal === 'string' ? c.campaignGoal : '';
    const focus = c.priorityService || '';
    if (!goal && !focus && platforms.length === 0) return undefined;
    return { goal, platforms, focus, focusDesc: c.notes || '' };
  }, [row.campaignId]);
  const genUsing = detailOpts
    ? [detailOpts.goal, detailOpts.platforms.join(', '), detailOpts.focus]
        .filter(Boolean)
        .join(' \u00b7 ')
    : '';
  const [fromDraft, setFromDraft] = useState<boolean>(!!existingDraft);
  const [savedAt, setSavedAt] = useState<string | undefined>(existingDraft?.savedAt);
  const [detail, setDetail] = useState<ContentDetail>(() => {
    const initial = existingDraft ? existingDraft.detail : generateDetail(row, brand, detailOpts);
    return isValidDetail(initial) ? initial : generateDetail(row, brand, detailOpts);
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
        'Regenerate this content from the idea? Your saved draft stays unchanged until you press Save Draft.',
      )
    ) {
      setDetail(generateDetail(row, brand, detailOpts));
      setFromDraft(false);
      toast('Content regenerated');
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
    toast('Content draft saved 💾');
    onDraftSaved();
    if (normalizeContentStatus(row.productionStatus) === 'Planning') {
      if (
        window.confirm(
          'Draft saved. Move this content from "Planning" to "In Production"?',
        )
      ) {
        onStatusChange(row.id, 'In Production');
        toast('Status changed to In Production');
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
            <div className="meta detail-meta">
              <span>
                {fmtDate(row.date)} · {row.day} · {row.format} · {row.objective}
              </span>
              <StatusBadge status={row.productionStatus} />
              {row.scheduledDate ? (
                <span className="detail-sched">
                  📅 {fmtDate(row.scheduledDate)}
                  {row.scheduledTime ? ' · ' + row.scheduledTime : ''}
                  {row.assignee ? ' · ' + row.assignee : ''}
                </span>
              ) : null}
            </div>
            {genUsing ? (
              <div className="meta" style={genUsingStyle}>
                Generated using: {genUsing}
              </div>
            ) : null}
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="modal-body">
          {fromDraft ? (
            <Note icon="✅" tone="saved" style={bannerStyle}>
              <strong>Draft saved.</strong> You are viewing the saved version
              {savedAt ? ' (' + fmtDateTime(savedAt) + ')' : ''}. Press{' '}
              <em>Regenerate</em> for a new version.
            </Note>
          ) : null}

          <Section n={1} icon="📝" title="Caption" copyValue={detail.caption} label="Caption">
            <div className="detail-box">{detail.caption}</div>
          </Section>
          <Section
            n={2}
            icon="⚡"
            title="Short Caption"
            copyValue={detail.shortCaption}
            label="Short caption"
          >
            <div className="detail-box">{detail.shortCaption}</div>
          </Section>
          <Section
            n={3}
            icon="🎥"
            title="Video Guide (Reels / Facebook)"
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
            title="Visual Direction"
            copyValue={detail.visualDirection}
            label="Visual direction"
          >
            <div className="detail-box">{detail.visualDirection}</div>
          </Section>
          <Section
            n={5}
            icon="🔤"
            title="Overlay Text Options"
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
            title="Pre-Posting Checklist"
            copyValue={detail.checklist.map((c) => '- ' + c).join('\n')}
            label="Posting checklist"
          >
            <ul className="chk">
              {detail.checklist.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </Section>

          <Note icon="⚠️" style={noteTopStyle}>
            Content is generated automatically as a draft. Review it before posting.
            Avoid medical claims &amp; guaranteed-result promises — “results may vary
            from person to person”.
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
            <Button variant="secondary" size="small" onClick={() => copyText(t.full, 'All content details', toast)}>
              📋 Copy All
            </Button>
          </div>
          <div className="foot-main">
            {fromDraft ? (
              <Button variant="ghost" size="small" onClick={handleRegen}>
                ↻ Regenerate
              </Button>
            ) : null}
            {onRequestAssign ? (
              <Button
                variant="secondary"
                size="small"
                onClick={() => onRequestAssign(row.id)}
              >
                {row.scheduledDate ? '🗓️ Edit Schedule' : '📅 Assign to Work Calendar'}
              </Button>
            ) : null}
            <Button onClick={handleSaveDraft}>💾 Save Draft</Button>
            <Button variant="ghost" size="small" onClick={onClose}>
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
