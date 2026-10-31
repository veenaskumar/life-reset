const DAY_MS = 24 * 60 * 60 * 1000;

export function dateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addDays(key: string, amount: number): string {
  const date = parseKey(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

export function daysBetween(from: string, to: string): number {
  const start = parseKey(from).getTime();
  const end = parseKey(to).getTime();
  return Math.round((end - start) / DAY_MS);
}

export function weekdayIndex(key: string): number {
  return parseKey(key).getDay();
}

export function formatShort(key: string): string {
  return parseKey(key).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function formatLong(key: string): string {
  return parseKey(key).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatWeekday(key: string): string {
  return parseKey(key).toLocaleDateString(undefined, { weekday: 'short' });
}

export function monthLabel(key: string): string {
  return parseKey(key).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function lastNDays(n: number, endKey: string = dateKey()): string[] {
  return Array.from({ length: n }, (_, index) => addDays(endKey, index - (n - 1)));
}
