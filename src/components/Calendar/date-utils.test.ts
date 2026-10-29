import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  compareDays,
  dayKey,
  daysInMonth,
  endOfMonth,
  endOfWeek,
  getMonthGrid,
  getWeekStartsOn,
  isSameDay,
  isSameMonth,
  isWithinRange,
  makeDay,
  monthKey,
  parseISODate,
  startOfMonth,
  startOfWeek,
  toDay,
  toISODate,
} from './date-utils';

const iso = (d: Date) => toISODate(d);

describe('date-utils', () => {
  it('pins days to local noon', () => {
    const d = toDay(new Date(2026, 9, 29, 23, 59, 59));
    expect(iso(d)).toBe('2026-10-29');
    expect(d.getHours()).toBe(12);
    expect(makeDay(2026, 9, 29).getHours()).toBe(12);
  });

  it('keeps two-digit years literal', () => {
    expect(makeDay(99, 11, 31).getFullYear()).toBe(99);
    expect(makeDay(99, 12, 1).getFullYear()).toBe(100);
    expect(toISODate(makeDay(5, 0, 1))).toBe('0005-01-01');
  });

  it('counts days in a month, including leap years', () => {
    expect(daysInMonth(2026, 1)).toBe(28);
    expect(daysInMonth(2024, 1)).toBe(29);
    expect(daysInMonth(2000, 1)).toBe(29); // divisible by 400
    expect(daysInMonth(1900, 1)).toBe(28); // divisible by 100
    expect(daysInMonth(2026, 0)).toBe(31);
    expect(daysInMonth(2026, 3)).toBe(30);
  });

  it('finds the start and end of a month', () => {
    expect(iso(startOfMonth(makeDay(2026, 9, 29)))).toBe('2026-10-01');
    expect(iso(endOfMonth(makeDay(2024, 1, 10)))).toBe('2024-02-29');
  });

  it('adds days across month and year boundaries', () => {
    expect(iso(addDays(makeDay(2026, 9, 31), 1))).toBe('2026-11-01');
    expect(iso(addDays(makeDay(2026, 0, 1), -1))).toBe('2025-12-31');
    expect(iso(addDays(makeDay(2024, 1, 28), 1))).toBe('2024-02-29');
    expect(iso(addDays(makeDay(2026, 9, 29), 7))).toBe('2026-11-05');
  });

  it('adds months with end-of-month clamping', () => {
    expect(iso(addMonths(makeDay(2026, 0, 31), 1))).toBe('2026-02-28');
    expect(iso(addMonths(makeDay(2024, 0, 31), 1))).toBe('2024-02-29');
    expect(iso(addMonths(makeDay(2026, 2, 31), -1))).toBe('2026-02-28');
    expect(iso(addMonths(makeDay(2026, 11, 15), 1))).toBe('2027-01-15');
    expect(iso(addMonths(makeDay(2026, 0, 15), -1))).toBe('2025-12-15');
    expect(iso(addMonths(makeDay(2026, 0, 15), -13))).toBe('2024-12-15');
    expect(iso(addMonths(makeDay(2026, 4, 31), 25))).toBe('2028-06-30');
  });

  it('adds years, clamping Feb 29', () => {
    expect(iso(addYears(makeDay(2024, 1, 29), 1))).toBe('2025-02-28');
    expect(iso(addYears(makeDay(2024, 1, 29), 4))).toBe('2028-02-29');
    expect(iso(addYears(makeDay(2026, 9, 29), -1))).toBe('2025-10-29');
  });

  it('compares by calendar day, ignoring the time', () => {
    const morning = new Date(2026, 9, 29, 0, 5);
    const night = new Date(2026, 9, 29, 23, 55);
    expect(isSameDay(morning, night)).toBe(true);
    expect(isSameDay(morning, null)).toBe(false);
    expect(isSameMonth(morning, makeDay(2026, 9, 1))).toBe(true);
    expect(isSameMonth(morning, makeDay(2025, 9, 1))).toBe(false);
    expect(compareDays(morning, night)).toBe(0);
    expect(compareDays(makeDay(2026, 9, 28), night)).toBeLessThan(0);
    expect(dayKey(morning)).toBe(20261029);
    expect(monthKey(morning)).toBe(202610);
  });

  it('finds the start and end of a week for any first day', () => {
    const thu = makeDay(2026, 9, 29); // Thursday
    expect(iso(startOfWeek(thu, 1))).toBe('2026-10-26'); // Monday
    expect(iso(startOfWeek(thu, 0))).toBe('2026-10-25'); // Sunday
    expect(iso(startOfWeek(thu, 6))).toBe('2026-10-24'); // Saturday
    expect(iso(startOfWeek(thu, 4))).toBe('2026-10-29'); // itself
    expect(iso(endOfWeek(thu, 1))).toBe('2026-11-01');
    expect(iso(endOfWeek(thu, 0))).toBe('2026-10-31');
  });

  it('always builds a 6×7 grid that starts on the week of the 1st', () => {
    for (let m = 0; m < 24; m++) {
      for (const wso of [0, 1, 6] as const) {
        const month = makeDay(2025, m, 1);
        const grid = getMonthGrid(month, wso);
        expect(grid).toHaveLength(6);
        grid.forEach((week) => expect(week).toHaveLength(7));
        const flat = grid.flat();
        expect(flat[0]?.getDay()).toBe(wso);
        expect(flat.some((d) => isSameDay(d, month))).toBe(true);
        expect(flat.some((d) => isSameDay(d, endOfMonth(month)))).toBe(true);
        // consecutive days, no duplicates or gaps
        flat.slice(1).forEach((d, i) => expect(iso(d)).toBe(iso(addDays(flat[i]!, 1))));
      }
    }
    // February 2026 starts on Sunday: with Monday weeks the first row is Jan 26 – Feb 1.
    expect(iso(getMonthGrid(makeDay(2026, 1, 1), 1)[0]![0]!)).toBe('2026-01-26');
    expect(iso(getMonthGrid(makeDay(2026, 1, 1), 0)[0]![0]!)).toBe('2026-02-01');
  });

  it('checks and clamps ranges inclusively by day', () => {
    const min = new Date(2026, 9, 10, 18); // time is ignored
    const max = makeDay(2026, 9, 20);
    expect(isWithinRange(makeDay(2026, 9, 10), min, max)).toBe(true);
    expect(isWithinRange(makeDay(2026, 9, 20), min, max)).toBe(true);
    expect(isWithinRange(makeDay(2026, 9, 9), min, max)).toBe(false);
    expect(isWithinRange(makeDay(2026, 9, 21), min, max)).toBe(false);
    expect(isWithinRange(makeDay(1900, 0, 1))).toBe(true);
    expect(iso(clampDate(makeDay(2026, 0, 1), min, max))).toBe('2026-10-10');
    expect(clampDate(makeDay(2026, 0, 1), min, max).getHours()).toBe(12);
    expect(iso(clampDate(makeDay(2027, 0, 1), min, max))).toBe('2026-10-20');
    expect(iso(clampDate(makeDay(2026, 9, 15), min, max))).toBe('2026-10-15');
  });

  it('formats and strictly parses YYYY-MM-DD without Date string parsing', () => {
    expect(toISODate(makeDay(2026, 0, 5))).toBe('2026-01-05');
    expect(iso(parseISODate('2024-02-29')!)).toBe('2024-02-29');
    expect(parseISODate('2024-02-29')!.getHours()).toBe(12);
    expect(parseISODate('2026-02-29')).toBeNull();
    expect(parseISODate('2026-13-01')).toBeNull();
    expect(parseISODate('2026-1-01')).toBeNull();
    expect(parseISODate('2026-10-29T00:00:00Z')).toBeNull();
  });

  it('derives the first day of the week from the locale', () => {
    expect(getWeekStartsOn('en-US')).toBe(0);
    expect(getWeekStartsOn('de-DE')).toBe(1);
    expect(getWeekStartsOn('en-GB')).toBe(1);
    expect(getWeekStartsOn('ar-EG')).toBe(6);
    expect(getWeekStartsOn('not a locale!')).toBe(1);
    expect([0, 1, 2, 3, 4, 5, 6]).toContain(getWeekStartsOn());
  });
});

/*
 * DST: run the same math in zones where a transition skips or repeats an hour, including
 * São Paulo's old midnight transition (2018-11-04 00:00 didn't exist), the classic source of
 * "the calendar shows the same day twice" bugs with millisecond arithmetic.
 */
describe.each(['America/Sao_Paulo', 'America/New_York', 'Europe/Belgrade', 'Australia/Lord_Howe'])(
  'date-utils across DST in %s',
  (zone) => {
    let previous: string | undefined;
    beforeAll(() => {
      previous = process.env.TZ;
      process.env.TZ = zone;
    });
    afterAll(() => {
      if (previous === undefined) delete process.env.TZ;
      else process.env.TZ = previous;
    });

    it('walks every day of 2018 and 2026 one by one without skipping or repeating', () => {
      for (const year of [2018, 2026]) {
        let day = makeDay(year, 0, 1);
        for (let i = 1; i < 365; i++) {
          const next = addDays(day, 1);
          expect(compareDays(next, day)).toBeGreaterThan(0);
          expect(next.getHours()).toBe(12);
          expect(isSameDay(next, makeDay(year, 0, 1 + i))).toBe(true);
          day = next;
        }
        expect(iso(day)).toBe(`${year}-12-31`);
      }
    });

    it('has 42 distinct days in grids that contain a transition', () => {
      for (const [y, m] of [[2018, 10], [2018, 1], [2026, 2], [2026, 9], [2026, 3]] as const) {
        const days = getMonthGrid(makeDay(y, m, 1), 0).flat().map(iso);
        expect(new Set(days).size).toBe(42);
      }
    });

    it('applies the zone (sanity check for the harness)', () => {
      if (zone === 'America/Sao_Paulo') {
        // Midnight didn't exist on 2018-11-04 in São Paulo; noon pinning sidesteps it.
        expect(new Date(2018, 10, 4).getHours()).toBe(1);
        expect(iso(addDays(makeDay(2018, 10, 3), 1))).toBe('2018-11-04');
      }
    });
  },
);
