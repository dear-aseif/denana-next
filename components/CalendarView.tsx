'use client';

/*
 * CalendarView
 * The scrollable 30-day calendar table. Renders the header row and maps each
 * ContentRow to a <ContentCard/> row. Ported from the prototype's table markup.
 */
import React from 'react';
import type { ContentRow } from '@/types/content';
import ContentCard from './ContentCard';

const HEADERS = [
  'Tanggal',
  'Format',
  'Pilar',
  'Topik & Hook',
  'CTA',
  'Tujuan',
  'Status',
  'Aksi',
];

export default function CalendarView({
  rows,
  draftIds,
  onField,
  onDetail,
  onCopy,
  onAssign,
}: {
  rows: ContentRow[];
  draftIds: Record<string, boolean>;
  onField: (id: string, key: keyof ContentRow, value: string) => void;
  onDetail: (id: string) => void;
  onCopy: (id: string) => void;
  onAssign: (id: string) => void;
}) {
  return (
    <div className="cal-wrap">
      <table className="cal">
        <thead>
          <tr>
            {HEADERS.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <ContentCard
              key={r.id}
              row={r}
              hasDraft={!!draftIds[r.id]}
              onField={onField}
              onDetail={onDetail}
              onCopy={onCopy}
              onAssign={onAssign}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
