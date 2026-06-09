'use client';

/*
 * ContentCard (Phase 16A; refined in Phase 16F)
 * A single editable row in the Content Planner master table (one <tr>).
 * Cells map to: Date | Format | Pillar | Topic & Hook | CTA | Goal | Status |
 * Schedule | Actions. Every editable cell mutates the row in place; the parent
 * persists to localStorage. Status and Schedule are now visually separated,
 * and row actions are grouped via PlannerActionGroup.
 */
import React from 'react';
import type { ContentRow, ContentStatus } from '@/types/content';
import { FORMATS, OBJECTIVES, PILLARS, pillarShort } from '@/data/sampleContent';
import { fmtDate } from '@/lib/utils';
import { useToast } from './ToastProvider';
import StatusBadge from './StatusBadge';
import StatusSelect from './StatusSelect';
import ScheduleChip from './ScheduleChip';
import ContentTopicCell from './ContentTopicCell';
import PlannerActionGroup from './PlannerActionGroup';

const pillarSelectStyle: React.CSSProperties = { marginTop: 4 };

function SelectCell({
  value,
  options,
  style,
  onChange,
}: {
  value: string;
  options: string[];
  style?: React.CSSProperties;
  onChange: (v: string) => void;
}) {
  return (
    <select
      className="cell-select"
      style={style}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}

export default function ContentCard({
  row,
  hasDraft,
  onField,
  onDetail,
  onCopy,
  onAssign,
}: {
  row: ContentRow;
  hasDraft: boolean;
  onField: (id: string, key: keyof ContentRow, value: string) => void;
  onDetail: (id: string) => void;
  onCopy: (id: string) => void;
  onAssign: (id: string) => void;
}) {
  const sc = pillarShort(row.pillar);
  const toast = useToast();

  /* Brief confirmation for dropdown-only changes (not textarea keystrokes). */
  function onSelectChange(key: keyof ContentRow, value: string) {
    onField(row.id, key, value);
    toast('Changes saved');
  }

  return (
    <tr data-id={row.id}>
      <td className="date">
        {fmtDate(row.date)}
        <small>{row.day}</small>
      </td>
      <td>
        <SelectCell
          value={String(row.format)}
          options={FORMATS}
          onChange={(v) => onSelectChange('format', v)}
        />
      </td>
      <td>
        <span className={'pill pill-' + sc}>{row.pillar}</span>
        <SelectCell
          value={String(row.pillar)}
          options={PILLARS}
          style={pillarSelectStyle}
          onChange={(v) => onSelectChange('pillar', v)}
        />
      </td>
      <td>
        <ContentTopicCell row={row} hasDraft={hasDraft} onField={onField} />
      </td>
      <td>
        <textarea
          className="cell-input cta-input"
          value={row.cta}
          onChange={(e) => onField(row.id, 'cta', e.target.value)}
          aria-label="CTA"
        />
      </td>
      <td>
        <SelectCell
          value={String(row.objective)}
          options={OBJECTIVES}
          onChange={(v) => onSelectChange('objective', v)}
        />
      </td>
      <td>
        <div className="status-cell">
          <StatusBadge status={row.productionStatus} />
          <StatusSelect
            value={row.productionStatus}
            className="status-cell-select"
            onChange={(s: ContentStatus) => onSelectChange('productionStatus', s)}
          />
        </div>
      </td>
      <td>
        <ScheduleChip row={row} />
      </td>
      <td>
        <PlannerActionGroup
          row={row}
          onDetail={onDetail}
          onAssign={onAssign}
          onCopy={onCopy}
        />
      </td>
    </tr>
  );
}
