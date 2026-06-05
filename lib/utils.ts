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
