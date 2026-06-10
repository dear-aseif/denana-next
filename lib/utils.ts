/*
 * Small date/string helpers ported verbatim from the prototype.
 * Pure functions — safe to use on server or client.
 */

export function toISO(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function dayName(d: Date): string {
  return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][d.getDay()];
}

export function fmtDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return iso;
  const m = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return d.getDate() + ' ' + m[d.getMonth()] + ' ' + d.getFullYear();
}

export function fmtDateTime(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return (
    fmtDate(toISO(d)) +
    ', ' +
    ('0' + d.getHours()).slice(-2) +
    ':' +
    ('0' + d.getMinutes()).slice(-2)
  );
}

export function uid(): string {
  return 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function lines(s: string): string[] {
  return String(s || '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean);
}

/* Phase 16I-Rev1: timezone-safe local date helpers.
 * The plan/generator run client-side in the user's timezone. Converting a
 * YYYY-MM-DD date through Date.toISOString() (UTC) shifted dates back a day for
 * UTC+ timezones (e.g. a June 10 start produced June 9 rows in Asia/Makassar).
 * These helpers keep date math in local/string space so the selected start
 * date is always preserved as the first generated row date. */
export function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = ('0' + (d.getMonth() + 1)).slice(-2);
  const day = ('0' + d.getDate()).slice(-2);
  return y + '-' + m + '-' + day;
}

export function addDaysISO(iso: string, n: number): string {
  const parts = String(iso || '').slice(0, 10).split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return iso;
  return isoLocal(new Date(y, m - 1, d + n));
}

export function dayNameFromISO(iso: string): string {
  const parts = String(iso || '').slice(0, 10).split('-');
  const y = Number(parts[0]);
  const m = Number(parts[1]);
  const d = Number(parts[2]);
  if (!y || !m || !d) return '';
  return dayName(new Date(y, m - 1, d));
}
