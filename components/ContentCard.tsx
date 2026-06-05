'use client';

/*
 * ContentCard
 * A single editable row in the content calendar table (one <tr>).
 * Ported from the prototype's buildRow() + inline cell inputs/selects.
 * Every cell edits the row in place; the parent persists to localStorage.
 */
import React from 'react';
import type { ContentRow } from '@/types/content';
import { FORMATS, OBJECTIVES, PILLARS, STATUSES, pillarShort } from '@/data/sampleContent';
import { fmtDate } from '@/lib/utils';
import Button from './Button';

const hookStyle: React.CSSProperties = {
  color: 'var(--notion-text-soft)',
  fontStyle: 'italic',
};
const pillarSelectStyle: React.CSSProperties = { marginTop: 4 };
const draftTagStyle: React.CSSProperties = { marginTop: 6 };

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
}: {
  row: ContentRow;
  hasDraft: boolean;
  onField: (id: string, key: keyof ContentRow, value: string) => void;
  onDetail: (id: string) => void;
  onCopy: (id: string) => void;
}) {
  const sc = pillarShort(row.pillar);
  const detailLabel = hasDraft ? '📝 Ada Draft' : '✍️ Buat Caption';

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
          onChange={(v) => onField(row.id, 'format', v)}
        />
      </td>
      <td>
        <span className={'pill pill-' + sc}>{row.pillar}</span>
        <SelectCell
          value={String(row.pillar)}
          options={PILLARS}
          style={pillarSelectStyle}
          onChange={(v) => onField(row.id, 'pillar', v)}
        />
      </td>
      <td>
        <textarea
          className="cell-input"
          value={row.topicTitle}
          onChange={(e) => onField(row.id, 'topicTitle', e.target.value)}
        />
        <textarea
          className="cell-input"
          style={hookStyle}
          value={row.hook}
          onChange={(e) => onField(row.id, 'hook', e.target.value)}
        />
        {hasDraft ? (
          <div style={draftTagStyle}>
            <span className="draft-badge">✓ Draft tersimpan</span>
          </div>
        ) : null}
      </td>
      <td>
        <textarea
          className="cell-input"
          value={row.cta}
          onChange={(e) => onField(row.id, 'cta', e.target.value)}
        />
      </td>
      <td>
        <SelectCell
          value={String(row.objective)}
          options={OBJECTIVES}
          onChange={(v) => onField(row.id, 'objective', v)}
        />
      </td>
      <td>
        <SelectCell
          value={String(row.productionStatus)}
          options={STATUSES}
          onChange={(v) => onField(row.id, 'productionStatus', v)}
        />
      </td>
      <td>
        <div className="row-actions">
          <Button size="small" onClick={() => onDetail(row.id)}>
            {detailLabel}
          </Button>
          <Button variant="ghost" size="tiny" onClick={() => onCopy(row.id)}>
            Copy
          </Button>
        </div>
      </td>
    </tr>
  );
}
