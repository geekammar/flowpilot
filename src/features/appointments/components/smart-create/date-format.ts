/** Shared calendar-date helpers for the booking wizard ("YYYY-MM-DD"). */

/** Shift a "YYYY-MM-DD" date by N days (timezone-independent math). */
export function moveDate(date: string, days: number): string {
  const value = new Date(`${date}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

/** Long Arabic display for a "YYYY-MM-DD" date (e.g. "الجمعة، 4 سبتمبر 2026"). */
export function formatArabicDate(date: string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

/** Short Arabic weekday for a date chip (e.g. "الجمعة"). */
export function formatArabicWeekday(date: string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

/** Short Arabic month for a date chip (e.g. "سبتمبر"). */
export function formatArabicMonth(date: string): string {
  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "UTC",
    month: "short",
  }).format(new Date(`${date}T00:00:00.000Z`));
}
