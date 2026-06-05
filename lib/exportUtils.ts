/*
 * exportUtils.ts
 * CSV export, plain-text export, and clipboard helpers.
 * Client-only (use inside event handlers / effects).
 *
 * Phase 1: Export/download is a real CSV download (kept from the prototype).
 * Future phases can extend this with PDF / Google Sheets / etc.
 */
import type { ContentRow } from '@/types/content';
import { fmtDate } from './utils';

/* ============================================================
   CSV EXPORT
   ============================================================ */
export function exportCSV(rows: ContentRow[], onDone?: (msg: string) => void): void {
  const headers = [
    'Date',
    'Day',
    'Format',
    'Pillar',
    'Topic Title',
    'Hook',
    'CTA',
    'Objective',
    'Production Status',
  ];
  const cell = (v: unknown) => {
    const s = String(v == null ? '' : v);
    return '"' + s.replace(/"/g, '""') + '"';
  };
  const out: string[] = [headers.map(cell).join(',')];
  rows.forEach((r) => {
    out.push(
      [
        r.date,
        r.day,
        r.format,
        r.pillar,
        r.topicTitle,
        r.hook,
        r.cta,
        r.objective,
        r.productionStatus,
      ]
        .map(cell)
        .join(','),
    );
  });
  const csv = '\ufeff' + out.join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'denana-content-calendar.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
  onDone?.('Rencana konten diekspor ke CSV');
}

export function calendarToText(rows: ContentRow[]): string {
  return rows
    .map((r, i) => {
      return (
        i +
        1 +
        '. ' +
        fmtDate(r.date) +
        ' (' +
        r.day +
        ') \u2014 ' +
        r.format +
        ' \u2014 ' +
        r.pillar +
        '\n' +
        '   Topik: ' +
        r.topicTitle +
        '\n   Hook: ' +
        r.hook +
        '\n   CTA: ' +
        r.cta +
        '\n   Objective: ' +
        r.objective +
        ' | Status: ' +
        r.productionStatus
      );
    })
    .join('\n\n');
}

/* ============================================================
   CLIPBOARD
   ============================================================ */
function fallbackCopy(text: string): void {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand('copy');
  } catch {
    /* ignore */
  }
  document.body.removeChild(ta);
}

export function copyText(
  text: string,
  label: string,
  onDone?: (msg: string) => void,
): void {
  const done = () => onDone?.((label || 'Teks') + ' disalin ke clipboard');
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done, () => {
      fallbackCopy(text);
      done();
    });
  } else {
    fallbackCopy(text);
    done();
  }
}
