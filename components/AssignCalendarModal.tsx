'use client';

/*
 * AssignCalendarModal (Phase 16D)
 * Small dialog to assign a content row to the Work Calendar:
 *   - scheduled date (required)
 *   - scheduled time (optional)
 *   - assignee (Owner / Staff 1 / Staff 2 / Designer, defaults to Owner)
 *
 * Reuses the existing .modal-overlay / .modal.modal-sm pattern (Escape +
 * overlay-click to close, body scroll lock) and the shared .field form styles.
 *
 * Presentational only: it reports the chosen values back to the parent, which
 * owns the storage write (assignContentToWorkCalendar) + planner/dashboard
 * refresh. It does NOT touch the status model or storage logic itself.
 *
 * Status messaging mirrors the helper rule:
 *   - Planning            -> will become Scheduled
 *   - any later status     -> kept as-is (only date/time/assignee updated)
 */
import React, { useEffect, useState } from 'react';
import type { ContentRow, ContentAssignee } from '@/types/content';
import { ASSIGNEES, pillarShort } from '@/data/sampleContent';
import { fmtDate } from '@/lib/utils';
import { getContentStatusLabel, normalizeContentStatus } from '@/lib/labels';
import Button from './Button';
import StatusBadge from './StatusBadge';

const previewMetaStyle: React.CSSProperties = { marginTop: 8 };

export type AssignPayload = {
  date: string;
  time: string | null;
  assignee: ContentAssignee | string;
};

export default function AssignCalendarModal({
  row,
  onAssign,
  onClose,
}: {
  row: ContentRow;
  onAssign: (id: string, opts: AssignPayload) => void;
  onClose: () => void;
}) {
  const current = normalizeContentStatus(row.productionStatus);
  const isEdit = !!row.scheduledDate;
  const [date, setDate] = useState<string>((row.scheduledDate || '').slice(0, 10));
  const [time, setTime] = useState<string>(row.scheduledTime || '');
  const [assignee, setAssignee] = useState<string>(row.assignee || 'Owner');
  const [touched, setTouched] = useState(false);

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

  function onOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  const dateInvalid = touched && !date;
  const keepsStatus = current !== 'Planning';

  function submit() {
    if (!date) {
      setTouched(true);
      return;
    }
    onAssign(row.id, { date, time: time || null, assignee: assignee || 'Owner' });
  }

  return (
    <div className="modal-overlay show" onClick={onOverlayClick}>
      <div
        className="modal modal-sm"
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? 'Edit Schedule' : 'Assign to Work Calendar'}
      >
        <div className="modal-head">
          <div className="mt">
            <h2>{isEdit ? 'Edit Schedule' : 'Assign to Work Calendar'}</h2>
            <p className="assign-sub">
              Pick a date to add this content to your Work Calendar. It stays in the
              Content Planner as the master copy.
            </p>
          </div>
          <button className="x-btn" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="modal-body">
          <div className="assign-preview">
            <span className={'pill pill-' + pillarShort(row.pillar)}>{row.pillar}</span>
            <div className="assign-topic">{row.topicTitle}</div>
            <div className="meta" style={previewMetaStyle}>
              {fmtDate(row.date)} · {row.day} · {row.format}{' '}
              <StatusBadge status={row.productionStatus} />
            </div>
          </div>

          <div className="assign-grid">
            <div className={'field' + (dateInvalid ? ' invalid' : '')}>
              <label>
                Scheduled date <span className="req">*</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {dateInvalid ? <p className="hint">Please choose a date.</p> : null}
            </div>
            <div className="field">
              <label>Scheduled time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
              <p className="hint">Optional.</p>
            </div>
            <div className="field full">
              <label>Assignee</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                {ASSIGNEES.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>
              <p className="hint">Who will work on this content. No login required yet.</p>
            </div>
          </div>

          {keepsStatus ? (
            <p className="assign-note">
              Status stays <strong>{getContentStatusLabel(row.productionStatus)}</strong>.
              Only the schedule and assignee are updated.
            </p>
          ) : (
            <p className="assign-note">
              Status will move from <strong>Planning</strong> to <strong>Scheduled</strong>.
            </p>
          )}
        </div>

        <div className="modal-foot assign-foot">
          <Button variant="ghost" size="small" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit}>
            {isEdit ? 'Save Schedule' : 'Assign to Calendar'}
          </Button>
        </div>
      </div>
    </div>
  );
}
