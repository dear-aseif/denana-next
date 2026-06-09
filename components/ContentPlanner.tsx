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
  assignContentToWorkCalendar,
} from '@/lib/storage';
import { generateCalendar } from '@/lib/generator';
import { exportCSV, calendarToText, copyText } from '@/lib/exportUtils';
import { fmtDate } from '@/lib/utils';
import { useToast } from './ToastProvider';
import Button from './Button';
import Note from './Note';
import Footer from './Footer';
import EmptyState from './EmptyState';
import PageHeader from './PageHeader';
import PlannerToolbar from './PlannerToolbar';
import CalendarView from './CalendarView';
import DetailModal from './DetailModal';
import AssignCalendarModal, { type AssignPayload } from './AssignCalendarModal';

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
  const [assignId, setAssignId] = useState<string | null>(null);

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
      toast('Complete your Brand Profile before planning content.');
      router.replace('/brand-setup');
    } else if (!c) {
      toast('Create a Campaign Plan before planning content.');
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
      toast('Complete your Brand Profile first.');
      router.replace('/brand-setup');
      return;
    }
    if (!campaign) {
      toast('Create a Campaign Plan first.');
      router.replace('/campaign-setup');
      return;
    }
    const next = generateCalendar(brand, campaign);
    persist(next);
    toast(next.length + ' content items created ✨');
  }

  function regenCal() {
    if (
      window.confirm(
        'Regenerate the entire content plan? Saved caption drafts are kept, but the content list will be replaced with a fresh one.',
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
      '\nTopic: ' +
      r.topicTitle +
      '\nHook: ' +
      r.hook +
      '\nCTA: ' +
      r.cta +
      '\nGoal: ' +
      r.objective +
      ' | Status: ' +
      r.productionStatus;
    copyText(text, 'Content', toast);
  }

  function handleStatusChange(id: string, status: string) {
    handleField(id, 'productionStatus', status);
  }

  /* Open the Assign-to-Work-Calendar dialog (from a row or the detail modal). */
  function handleRequestAssign(id: string) {
    setOpenId(null);
    setAssignId(id);
  }

  /*
   * Persist an assignment via the Phase 16B helper. The helper updates the
   * ORIGINAL content row (scheduledDate/time/assignee + Planning->Scheduled)
   * on the active campaign record, so we just re-read the calendar to refresh
   * the table. The Dashboard reads the same campaign store, so Today's /
   * Upcoming Work picks the item up on its next load.
   */
  function handleAssign(id: string, opts: AssignPayload) {
    assignContentToWorkCalendar(id, {
      date: opts.date,
      time: opts.time,
      assignee: opts.assignee,
    });
    setRows(getCalendar());
    setAssignId(null);
    toast('Added to Work Calendar 📅');
  }

  if (!mounted) return null;

  const openRow = openId ? rows.find((r) => r.id === openId) || null : null;
  const assignRow = assignId ? rows.find((r) => r.id === assignId) || null : null;
  const counts =
    filtered.length +
    ' of ' +
    rows.length +
    ' items · ' +
    draftCount() +
    ' drafts saved';

  return (
    <>
      <PageHeader
        eyebrow="Content Planner"
        title="Content Planner"
        subtitle="Plan, edit, schedule, and track all campaign content from one master list."
      />

      {rows.length === 0 ? (
        <section>
          <div className="card">
            <EmptyState
              big="🗓️"
              title="No content plan yet"
              action={<Button onClick={doGenerate}>✨ Generate 30-Day Content Plan</Button>}
            >
              Generate a 30-day content plan automatically from the Brand Profile
              and Campaign Plan you have saved.
            </EmptyState>
          </div>
        </section>
      ) : (
        <>
          <section>
            <PlannerToolbar
              pillars={PILLARS}
              formats={FORMATS}
              fPillar={fPillar}
              fFormat={fFormat}
              onPillar={setFPillar}
              onFormat={setFFormat}
              count={counts}
              onCopy={copyCal}
              onExport={csvCal}
              onRegenerate={regenCal}
            />
          </section>

          <section>
            {filtered.length === 0 ? (
              <div className="card">
                <EmptyState big="🔍" title="No content matches these filters.">
                  Try clearing the pillar or format filter to see more content.
                </EmptyState>
              </div>
            ) : (
              <CalendarView
                rows={filtered}
                draftIds={draftIds}
                onField={handleField}
                onDetail={(id) => setOpenId(id)}
                onCopy={copyRow}
                onAssign={handleRequestAssign}
              />
            )}
          </section>

          <section>
            <Note icon="✏️" style={noteTopStyle}>
              All columns are editable inline. Changes save automatically in this
              browser. Use <strong>Open Detail</strong> to build the caption &amp;
              script, then save it as a draft.
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
          onRequestAssign={handleRequestAssign}
        />
      ) : null}

      {assignRow ? (
        <AssignCalendarModal
          row={assignRow}
          onAssign={handleAssign}
          onClose={() => setAssignId(null)}
        />
      ) : null}
    </>
  );
}
