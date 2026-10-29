/*
 * Dependency-free calendar-date math. Internal: not exported from the package.
 *
 * Every Date produced here is a *calendar day* pinned to local noon. Arithmetic goes through
 * the y/m/d constructor (`new Date(y, m, d + n, 12)`), never through milliseconds, so DST
 * transitions (23/25-hour days, or midnight that doesn't exist in some zones) can't shift a
 * date into the neighbouring day. Strings are never parsed with `Date`.
 */

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Same calendar day, at local noon. */
export function toDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
}

/** Builds a calendar day from parts (month is 0-based, like `Date`). Overflow rolls over. */
export function makeDay(year: number, month: number, day: number): Date {
  const date = new Date(year, month, day, 12);
  // The constructor maps years 0–99 to 1900–1999; undo that (overflow into the next year is kept).
  if (year >= 0 && year < 100) date.setFullYear(date.getFullYear() - 1900);
  return date;
}

export function daysInMonth(year: number, month: number): number {
  // Day 0 of the next month is the last day of this one.
  return makeDay(year, month + 1, 0).getDate();
}

export function startOfMonth(date: Date): Date {
  return makeDay(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return makeDay(date.getFullYear(), date.getMonth(), daysInMonth(date.getFullYear(), date.getMonth()));
}

export function addDays(date: Date, amount: number): Date {
  return makeDay(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Adds months, clamping the day to the target month's length (Jan 31 + 1 month → Feb 28/29). */
export function addMonths(date: Date, amount: number): Date {
  const target = date.getMonth() + amount;
  const year = date.getFullYear() + Math.floor(target / 12);
  const month = ((target % 12) + 12) % 12;
  return makeDay(year, month, Math.min(date.getDate(), daysInMonth(year, month)));
}

export function addYears(date: Date, amount: number): Date {
  return addMonths(date, amount * 12);
}

/** Sortable integer for a calendar day: 2026-10-29 → 20261029. */
export function dayKey(date: Date): number {
  return date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
}

/** Sortable integer for a month: October 2026 → 202610. */
export function monthKey(date: Date): number {
  return date.getFullYear() * 100 + date.getMonth() + 1;
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return a != null && b != null && dayKey(a) === dayKey(b);
}

export function isSameMonth(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return a != null && b != null && monthKey(a) === monthKey(b);
}

/** Negative if `a` is an earlier day than `b`, 0 on the same day, positive if later. */
export function compareDays(a: Date, b: Date): number {
  return dayKey(a) - dayKey(b);
}

export function startOfWeek(date: Date, weekStartsOn: WeekDay = 1): Date {
  return addDays(date, -((date.getDay() - weekStartsOn + 7) % 7));
}

export function endOfWeek(date: Date, weekStartsOn: WeekDay = 1): Date {
  return addDays(startOfWeek(date, weekStartsOn), 6);
}

/**
 * Always 6 weeks × 7 days, starting on the week that contains the 1st, so the grid never
 * changes height between months.
 */
export function getMonthGrid(month: Date, weekStartsOn: WeekDay = 1): Date[][] {
  const first = startOfWeek(startOfMonth(month), weekStartsOn);
  return Array.from({ length: 6 }, (_, week) => Array.from({ length: 7 }, (_, day) => addDays(first, week * 7 + day)));
}

/** Inclusive, by calendar day. Missing bounds are open. */
export function isWithinRange(date: Date, min?: Date | null, max?: Date | null): boolean {
  if (min && compareDays(date, min) < 0) return false;
  if (max && compareDays(date, max) > 0) return false;
  return true;
}

/** Moves `date` into [min, max] (by calendar day). Returns a noon-pinned day. */
export function clampDate(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(date, min) < 0) return toDay(min);
  if (max && compareDays(date, max) > 0) return toDay(max);
  return toDay(date);
}

/** Local calendar date as `YYYY-MM-DD` (what `<input type="date">` and most APIs expect). */
export function toISODate(date: Date): string {
  const y = String(date.getFullYear()).padStart(4, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Strict `YYYY-MM-DD` → noon-pinned day, or null. Parses digits by hand (never `new Date(string)`). */
export function parseISODate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month - 1)) return null;
  return makeDay(year, month - 1, day);
}

type WeekInfo = { firstDay?: number };
type LocaleWithWeekInfo = Intl.Locale & { getWeekInfo?: () => WeekInfo; weekInfo?: WeekInfo };

/** Regions whose week starts on Sunday, for engines without `Intl.Locale#getWeekInfo` (Firefox). */
const SUNDAY_REGIONS = new Set(['US', 'CA', 'MX', 'BR', 'JP', 'KR', 'TW', 'HK', 'IL', 'PH', 'IN', 'ZA', 'AU']);

/**
 * First day of the week for a locale: `Intl.Locale#getWeekInfo()` where available
 * (Chrome, Safari, Node), else Sunday for a short list of regions, else Monday (ISO 8601).
 */
export function getWeekStartsOn(locale?: string): WeekDay {
  try {
    const tag = locale ?? new Intl.DateTimeFormat().resolvedOptions().locale;
    const loc = new Intl.Locale(tag) as LocaleWithWeekInfo;
    const info = typeof loc.getWeekInfo === 'function' ? loc.getWeekInfo() : loc.weekInfo;
    if (info?.firstDay) return (info.firstDay % 7) as WeekDay;
    const region = loc.maximize().region;
    if (region && SUNDAY_REGIONS.has(region)) return 0;
  } catch {
    // Invalid locale tag: fall through to the ISO default.
  }
  return 1;
}
