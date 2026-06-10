'use client';

/*
 * WorkCalendarView (Phase 16E) — Work Calendar MVP (Day Agenda)
 *
 * A read/edit VIEW over scheduled content rows. It never duplicates content:
 * every task card references the original ContentRow (via the WorkItem shape),
 * and all mutations go through the Phase 16B/16D storage helpers, so changes
 * here also reflect in the Content Planner and the Dashboard.
 *
 * Responsibilities:
 *  - Own the selected ISO date (defaults to local today).
 *  - Load scheduled items (getWorkItems) and filter to the selected day.
 *  - Day navigation (prev / today / next / native date picker).
 *  - Daily five-status summary counts.
 *  - Per-task: change status (updateContentStatus), change assignee
 *    (updateContentAssignee), edit schedule (AssignCalendarModal ->
 *    assignContentToWorkCalendar), remove (unassignContentFromWorkCalendar).
 *  - Calm empty state with a route back to the Content Planner.
 *
 * No month grid, no drag-and-drop, no auth (per phase scope).
 */
import React, { useEffect, useMemo, useState } from 'react';
import type { ContentStatus, ContentAssignee } from '@/types/content';
import {
  getWorkItems,
  updateContentStatus,
  updateContentAssignee,
  assignContentToWorkCalendar,
  unassignContentFromWorkCalendar,
  type WorkItem,
} from '@/lib/storage';
import { useToast } from './ToastProvider';
import PageHeader from './PageHeader';
import Card from './Card';
import Button from './Button';
import EmptyState from './EmptyState';
import Footer from './Footer';
import DateNavigator from './DateNavigator';
import WorkDaySummary from './WorkDaySummary';
import WorkTaskCard from './WorkTaskCard';
import AssignCalendarModal, { type AssignPayload } from './AssignCalendarModal';

function localISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + m + '-' + day;
}

export default function WorkCalendarView() {
  const toast = useToast();
  const [mounted, setMounted] = useState(false);
  const [todayISO, setTodayISO] = useState('');
  const [selected, setSelected] = useState('');
  const [items, setItems] = useState<WorkItem[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    const t = localISO(new Date());
    setTodayISO(t);
    setSelected(t);
    setItems(getWorkItems());
    setMounted(true);
  }, []);

  function refresh() {
    setItems(getWorkItems());
  }

  const dayItems = useMemo(
    () => items.filter((i) => (i.scheduledDate || '').slice(0, 10) === selected),
    [items, selected],
  );

  function handleStatus(id: string, status: ContentStatus) {
    updateContentStatus(id, status);
    refresh();
    toast('Status updated to ' + status);
  }

  function handleAssignee(id: string, assignee: ContentAssignee) {
    updateContentAssignee(id, assignee);
    refresh();
    toast('Assignee updated to ' + assignee);
  }

  function handleEditSave(id: string, opts: AssignPayload) {
    assignContentToWorkCalendar(id, {
      date: opts.date,
      time: opts.time,
      assignee: opts.assignee,
    });
    refresh();
    setEditId(null);
    // Follow the task to its new date so it stays visible after editing.
    if (opts.date && opts.date !== selected) setSelected(opts.date);
    toast('Schedule updated 📅');
  }

  function handleRemove(id: string) {
    if (
      !window.confirm(
        'Remove this content from the Work Calendar? It stays in the Content Planner. If it is still "Scheduled", it will move back to "Planning".',
      )
    ) {
      return;
    }
    unassignContentFromWorkCalendar(id);
    refresh();
    toast('Removed from Work Calendar');
  }

  if (!mounted) return null;

  const editRow = editId ? items.find((i) => i.id === editId) || null : null;

  return (
    <>
      <div className="wc-page">
      <PageHeader
        eyebrow="Work Calendar"
        title="Work Calendar"
        subtitle="Manage scheduled content production by day."
        actions={
          <Button href="/content-calendar" variant="ghost" size="small">
            Open Content Planner
          </Button>
        }
      />

      <section>
        <Card className="wc-toolbar">
          <DateNavigator value={selected} todayISO={todayISO} onChange={setSelected} />
          <WorkDaySummary items={dayItems} />
        </Card>
      </section>

      <section className="wc-agenda">
        {dayItems.length > 0 ? (
          dayItems.map((item) => (
            <WorkTaskCard
              key={item.id}
              item={item}
              onStatus={handleStatus}
              onAssignee={handleAssignee}
              onEditSchedule={(id) => setEditId(id)}
              onRemove={handleRemove}
            />
          ))
        ) : (
          <Card className="wc-empty-card">
            <EmptyState
              big="🗓️"
              title="No work scheduled for this date"
              action={
                <Button href="/content-calendar" variant="secondary" size="small">
                  Go to Content Planner
                </Button>
              }
            >
              Assign content from Content Planner to start planning daily production.
            </EmptyState>
          </Card>
        )}
      </section>
      </div>

      <Footer />

      {editRow ? (
        <AssignCalendarModal
          row={editRow}
          onAssign={handleEditSave}
          onClose={() => setEditId(null)}
        />
      ) : null}
    </>
  );
}
