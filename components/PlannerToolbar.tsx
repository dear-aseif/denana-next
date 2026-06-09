'use client';

/*
 * PlannerToolbar (Phase 16F)
 * The Content Planner top controls, extracted for clarity and English copy:
 *   [Pillar filter] [Format filter]  count · drafts  —spacer—  Copy  Export CSV  Regenerate
 * Presentational only: filter values + every action are owned by the parent.
 */
import React from 'react';
import Button from './Button';

const filterSelectStyle: React.CSSProperties = { maxWidth: 180 };
const spacerStyle: React.CSSProperties = { flex: 1 };

export default function PlannerToolbar({
  pillars,
  formats,
  fPillar,
  fFormat,
  onPillar,
  onFormat,
  count,
  onCopy,
  onExport,
  onRegenerate,
}: {
  pillars: string[];
  formats: string[];
  fPillar: string;
  fFormat: string;
  onPillar: (v: string) => void;
  onFormat: (v: string) => void;
  count: string;
  onCopy: () => void;
  onExport: () => void;
  onRegenerate: () => void;
}) {
  return (
    <div className="toolbar planner-toolbar">
      <select
        className="cell-select"
        style={filterSelectStyle}
        value={fPillar}
        onChange={(e) => onPillar(e.target.value)}
        aria-label="Filter by pillar"
      >
        <option value="">All Pillars</option>
        {pillars.map((p) => (
          <option key={p}>{p}</option>
        ))}
      </select>
      <select
        className="cell-select"
        style={filterSelectStyle}
        value={fFormat}
        onChange={(e) => onFormat(e.target.value)}
        aria-label="Filter by format"
      >
        <option value="">All Formats</option>
        {formats.map((f) => (
          <option key={f}>{f}</option>
        ))}
      </select>
      <span className="planner-count">{count}</span>
      <span className="spacer" style={spacerStyle} />
      <Button variant="ghost" size="small" onClick={onCopy}>
        📋 Copy
      </Button>
      <Button variant="secondary" size="small" onClick={onExport}>
        ⬇️ Export CSV
      </Button>
      <Button variant="ghost" size="small" onClick={onRegenerate}>
        ↻ Regenerate
      </Button>
    </div>
  );
}
