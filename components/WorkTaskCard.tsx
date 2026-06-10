'use client';

/*
 * WorkTaskCard (Phase 16E)
 * A single scheduled task in the Work Calendar day agenda. It references the
 * ORIGINAL content row (via WorkItem) — it never duplicates content. The card
 * surfaces topic, campaign, time, format, pillar, assignee, and a status badge,
 * and exposes inline status + assignee changes plus Edit Schedule / Remove.
 *
 * Presentational: all mutations are reported to the parent, which owns the
 * storage writes (updateContentStatus / updateContentAssignee /
 * unassignContentFromWorkCalendar) and the refresh.
 */
import React from 'react';
import type { WorkItem } from '@/lib/storage';
import type { ContentStatus, ContentAssignee } from '@/types/content';
import { pillarShort } from '@/data/sampleContent';
import Card from './Card';
import Button from './Button';
import StatusBadge from './StatusBadge';
import StatusSelect from './StatusSelect';
import AssigneeSelect from './AssigneeSelect';

export default function WorkTaskCard({
  item,
  onStatus,
  onAssignee,
  onEditSchedule,
  onRemove,
}: {
  item: WorkItem;
  onStatus: (id: string, status: ContentStatus) => void;
  onAssignee: (id: string, assignee: ContentAssignee) => void;
  onEditSchedule: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const sc = pillarShort(item.pillar);
  return (
    <Card className="wc-task">
      {/* Top row: time + status badge */}
      <div className="wc-task-top">
        <div className="wc-task-time">
          <span className="wc-task-time-val">{item.scheduledTime || '——:——'}</span>
          {item.scheduledTime ? null : <span className="wc-task-time-label">No time set</span>}
        </div>
        <StatusBadge status={item.productionStatus} />
      </div>

      {/* Middle: title + campaign / focus metadata */}
      <div className="wc-task-body">
        <p className="wc-task-title">{item.topicTitle || 'Untitled content'}</p>
        <div className="wc-task-meta">
          {item.pillar ? <span className={'pill pill-' + sc}>{item.pillar}</span> : null}
          {item.format ? <span className="wc-task-format">{item.format}</span> : null}
          {item.campaignName ? <span className="wc-task-meta-item">{item.campaignName}</span> : null}
        </div>
      </div>

      {/* Bottom: assignee + status selects, then schedule actions */}
      <div className="wc-task-controls">
        <label className="wc-ctl">
          <span className="wc-ctl-label">Assignee</span>
          <AssigneeSelect
            value={item.assignee}
            onChange={(a) => onAssignee(item.id, a)}
          />
        </label>
        <label className="wc-ctl">
          <span className="wc-ctl-label">Status</span>
          <StatusSelect
            value={item.productionStatus}
            onChange={(s) => onStatus(item.id, s)}
          />
        </label>
        <div className="wc-task-actions">
          <Button variant="secondary" size="tiny" onClick={() => onEditSchedule(item.id)}>
            🗓️ Edit Schedule
          </Button>
          <Button variant="ghost" size="tiny" className="wc-btn-danger" onClick={() => onRemove(item.id)}>
            Remove
          </Button>
        </div>
      </div>
    </Card>
  );
}
