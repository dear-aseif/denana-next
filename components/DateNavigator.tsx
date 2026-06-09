'use client';

/*
 * DateNavigator (Phase 16E)
 * Compact day navigation for the Work Calendar:
 *   [< Previous]  [Today]  [Next >]   [native date input]
 * plus a readable English label for the selected date ("Today" / "Tomorrow" /
 * "Yesterday" relative hints included). Stateless: the parent owns the selected
 * ISO date (YYYY-MM-DD) and applies changes.
 */
import React from 'react';
import Button from './Button';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

function parseISO(iso: string): Date {
  return new Date(iso + 'T00:00:00');
}

export function readableDate(iso: string): string {
  const d = parseISO(iso);
  if (isNaN(d.getTime())) return iso;
  return WEEKDAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

export default function DateNavigator({
  value,
  todayISO,
  onChange,
}: {
  value: string;
  todayISO: string;
  onChange: (iso: string) => void;
}) {
  function shift(days: number) {
    const d = parseISO(value);
    d.setDate(d.getDate() + days);
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    onChange(d.getFullYear() + '-' + m + '-' + day);
  }

  const isToday = value === todayISO;
  let relative = '';
  const diff = Math.round(
    (parseISO(value).getTime() - parseISO(todayISO).getTime()) / 86400000,
  );
  if (diff === 0) relative = 'Today';
  else if (diff === 1) relative = 'Tomorrow';
  else if (diff === -1) relative = 'Yesterday';

  return (
    <div className="wc-nav">
      <div className="wc-nav-controls">
        <Button variant="ghost" size="small" onClick={() => shift(-1)}>
          ← Previous
        </Button>
        <Button
          variant={isToday ? 'secondary' : 'ghost'}
          size="small"
          onClick={() => onChange(todayISO)}
        >
          Today
        </Button>
        <Button variant="ghost" size="small" onClick={() => shift(1)}>
          Next →
        </Button>
        <input
          type="date"
          className="wc-date-input"
          value={value}
          onChange={(e) => e.target.value && onChange(e.target.value)}
          aria-label="Pick a date"
        />
      </div>
      <div className="wc-nav-label">
        <span className="wc-nav-date">{readableDate(value)}</span>
        {relative ? <span className="wc-nav-relative">{relative}</span> : null}
      </div>
    </div>
  );
}
