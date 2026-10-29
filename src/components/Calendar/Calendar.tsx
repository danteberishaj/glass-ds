'use client';

import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import { Button } from '../Button';
import styles from './Calendar.module.css';
import {
  addDays,
  addMonths,
  addYears,
  clampDate,
  dayKey,
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
  type WeekDay,
} from './date-utils';

/*
 * WAI-ARIA date grid (https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/).
 * Client component: state, effects, useId. All date math lives in date-utils.ts (noon-pinned days).
 */

export type CalendarSurface = 'glass' | 'none';
type Direction = 'none' | 'next' | 'prev';

export type CalendarProps = Omit<
  ComponentPropsWithRef<'div'>,
  'defaultValue' | 'onChange' | 'autoFocus' | 'children'
> & {
  /** Selected day (controlled). `null` = nothing selected. */
  value?: Date | null;
  /** Initially selected day (uncontrolled). */
  defaultValue?: Date | null;
  /** Called with the picked day (pinned to local noon). */
  onValueChange?: (value: Date) => void;
  /** Visible month (controlled). Any day in the month works. */
  month?: Date;
  /** Initially visible month (uncontrolled). Defaults to the selected day's month, else today's. */
  defaultMonth?: Date;
  /** Called with the 1st of the new month when the visible month changes. */
  onMonthChange?: (month: Date) => void;
  /** Earliest selectable day (inclusive). */
  min?: Date | null;
  /** Latest selectable day (inclusive). */
  max?: Date | null;
  /** Return `true` to disable a day. Disabled days stay focusable (APG) but can't be picked. */
  isDateDisabled?: (date: Date) => boolean;
  /** BCP 47 tag for month/weekday names and digits. Default: the runtime's locale (pass one when server-rendering). */
  locale?: string;
  /** 0 = Sunday … 6 = Saturday. Default: from `Intl.Locale#getWeekInfo()`, else Monday. */
  weekStartsOn?: WeekDay;
  /** Show the leading/trailing days of the neighbouring months. Default `true`. */
  showOutsideDays?: boolean;
  /** Focus the active day on mount (used by DatePicker when it opens). */
  autoFocus?: boolean;
  /** `glass` (default): a glass card. `none`: no surface, for use inside another glass layer. */
  surface?: CalendarSurface;
  /** Accessible label of the previous-month button. */
  previousMonthLabel?: string;
  /** Accessible label of the next-month button. */
  nextMonthLabel?: string;
};

// "Today" is read after hydration (server snapshot = null), so server and client markup agree.
// Re-checked every minute so a page left open past midnight moves the marker.
const subscribeToClock = (onChange: () => void) => {
  const id = setInterval(onChange, 60_000);
  return () => clearInterval(id);
};
const getTodayKey = () => dayKey(new Date());
const getServerTodayKey = () => null;

function useToday(): Date | null {
  const key = useSyncExternalStore(subscribeToClock, getTodayKey, getServerTodayKey);
  return useMemo(
    () => (key === null ? null : makeDay(Math.floor(key / 10000), (Math.floor(key / 100) % 100) - 1, key % 100)),
    [key],
  );
}

export function Calendar({
  value: valueProp,
  defaultValue = null,
  onValueChange,
  month: monthProp,
  defaultMonth,
  onMonthChange,
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn: weekStartsOnProp,
  showOutsideDays = true,
  autoFocus = false,
  surface = 'glass',
  previousMonthLabel = 'Previous month',
  nextMonthLabel = 'Next month',
  className,
  'aria-label': ariaLabel,
  ...rest
}: CalendarProps) {
  const headingId = useId();
  const gridRef = useRef<HTMLTableElement>(null);
  /** Set by keyboard moves; the effect below moves DOM focus once the target day has rendered. */
  const pendingFocus = useRef(false);
  const today = useToday();

  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : uncontrolledValue;

  const [uncontrolledMonth, setUncontrolledMonth] = useState(() =>
    startOfMonth(defaultMonth ?? value ?? clampDate(new Date(), min, max)),
  );
  const month = startOfMonth(monthProp ?? uncontrolledMonth);
  const currentMonthKey = monthKey(month);

  // Direction of the last month change, for the slide. Derived during render from the previous
  // month (React's "adjust state on prop change" pattern), so controlled changes animate too.
  const [nav, setNav] = useState<{ key: number; direction: Direction }>({ key: currentMonthKey, direction: 'none' });
  let direction = nav.direction;
  if (nav.key !== currentMonthKey) {
    direction = currentMonthKey > nav.key ? 'next' : 'prev';
    setNav({ key: currentMonthKey, direction });
  }

  /** The day the user last moved to; only used while it is in the visible month. */
  const [activeDate, setActiveDate] = useState<Date | null>(null);
  /** Day key of the last pick, so only a fresh selection pops (not every re-render or month change). */
  const [poppedKey, setPoppedKey] = useState<number | null>(null);

  const weekStartsOn = useMemo(() => weekStartsOnProp ?? getWeekStartsOn(locale), [weekStartsOnProp, locale]);
  const formatters = useMemo(
    () => ({
      heading: new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }),
      day: new Intl.DateTimeFormat(locale, { day: 'numeric' }),
      full: new Intl.DateTimeFormat(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      weekdayLong: new Intl.DateTimeFormat(locale, { weekday: 'long' }),
      weekdayShort: new Intl.DateTimeFormat(locale, { weekday: 'short' }),
      weekdayNarrow: new Intl.DateTimeFormat(locale, { weekday: 'narrow' }),
    }),
    [locale],
  );

  const weeks = getMonthGrid(month, weekStartsOn);
  const isDisabled = (date: Date) => !isWithinRange(date, min, max) || Boolean(isDateDisabled?.(date));

  // Roving tabindex: exactly one day is tabbable: the last focused, else selected, else today,
  // else the first enabled day of the month.
  const inMonth = (date: Date | null): date is Date => date !== null && isSameMonth(date, month);
  const focusDate = inMonth(activeDate)
    ? activeDate
    : inMonth(value)
      ? value
      : inMonth(today)
        ? today
        : (weeks.flat().find((d) => isSameMonth(d, month) && !isDisabled(d)) ?? month);
  const focusKey = dayKey(focusDate);

  const prevDisabled = min != null && monthKey(addMonths(month, -1)) < monthKey(min);
  const nextDisabled = max != null && monthKey(addMonths(month, 1)) > monthKey(max);

  function changeMonth(next: Date) {
    const first = startOfMonth(next);
    if (monthKey(first) === currentMonthKey) return;
    if (monthProp === undefined) setUncontrolledMonth(first);
    onMonthChange?.(first);
  }

  function select(date: Date) {
    setActiveDate(date);
    if (!isSameMonth(date, month)) changeMonth(date);
    if (isDisabled(date)) return;
    const day = toDay(date);
    setPoppedKey(dayKey(day));
    if (valueProp === undefined) setUncontrolledValue(day);
    onValueChange?.(day);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-date]');
    const current = button?.dataset.date ? parseISODate(button.dataset.date) : null;
    if (!current) return;

    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    let next: Date;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(current, rtl ? 1 : -1);
        break;
      case 'ArrowRight':
        next = addDays(current, rtl ? -1 : 1);
        break;
      case 'ArrowUp':
        next = addDays(current, -7);
        break;
      case 'ArrowDown':
        next = addDays(current, 7);
        break;
      case 'Home':
        next = startOfWeek(current, weekStartsOn);
        break;
      case 'End':
        next = endOfWeek(current, weekStartsOn);
        break;
      case 'PageUp':
        next = event.shiftKey ? addYears(current, -1) : addMonths(current, -1);
        break;
      case 'PageDown':
        next = event.shiftKey ? addYears(current, 1) : addMonths(current, 1);
        break;
      default:
        return; // Enter/Space: the day is a <button>, so they click it.
    }
    event.preventDefault();
    next = clampDate(next, min, max);
    pendingFocus.current = true;
    setActiveDate(next);
    if (!isSameMonth(next, month)) changeMonth(next);
  }

  // Keep the roving day in sync with DOM focus, however it got there (click, programmatic focus).
  function handleFocus(event: FocusEvent<HTMLTableElement>) {
    const date = (event.target as HTMLElement).dataset.date;
    const focused = date ? parseISODate(date) : null;
    if (focused && isSameMonth(focused, month) && dayKey(focused) !== focusKey) setActiveDate(focused);
  }

  // Keyboard moves: focus the new day once it is rendered (the grid body is re-keyed on month change).
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    gridRef.current?.querySelector<HTMLButtonElement>(`button[data-date="${toISODate(focusDate)}"]`)?.focus();
    // focusDate is derived from focusKey; depending on the key avoids re-running on new Date objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusKey, currentMonthKey]);

  useEffect(() => {
    if (!autoFocus) return;
    gridRef.current?.querySelector<HTMLButtonElement>('button[tabindex="0"]')?.focus({ preventScroll: true });
    // Mount only: autoFocus is a one-shot, like the native attribute.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role={ariaLabel ? 'group' : undefined}
      aria-label={ariaLabel}
      data-surface={surface}
      className={cx(surface === 'glass' && GLASS_CLASS, styles.root, className)}
      {...rest}
    >
      <div className={styles.header}>
        <Button
          variant="ghost"
          size="sm"
          aria-label={previousMonthLabel}
          aria-disabled={prevDisabled || undefined}
          className={styles.nav}
          onClick={() => !prevDisabled && changeMonth(addMonths(month, -1))}
        >
          <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M10 3.5 5.5 8l4.5 4.5" />
          </svg>
        </Button>
        <div id={headingId} className={styles.heading} aria-live="polite">
          {formatters.heading.format(month)}
        </div>
        <Button
          variant="ghost"
          size="sm"
          aria-label={nextMonthLabel}
          aria-disabled={nextDisabled || undefined}
          className={styles.nav}
          onClick={() => !nextDisabled && changeMonth(addMonths(month, 1))}
        >
          <svg className={styles.chevron} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            <path d="M6 3.5 10.5 8 6 12.5" />
          </svg>
        </Button>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={headingId}
        className={styles.grid}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
      >
        <thead>
          <tr>
            {(weeks[0] ?? []).map((day) => {
              const short = formatters.weekdayShort.format(day);
              return (
                <th key={day.getDay()} scope="col" abbr={formatters.weekdayLong.format(day)} className={styles.weekday}>
                  {/* Long "short" names (e.g. Arabic) don't fit a 40px column; fall back to narrow. */}
                  {short.length > 3 ? formatters.weekdayNarrow.format(day) : short}
                </th>
              );
            })}
          </tr>
        </thead>
        {/* Keyed on the month: a new body mounts and plays the slide in data-direction. */}
        <tbody key={currentMonthKey} data-direction={direction} className={styles.body}>
          {weeks.map((week) => (
            <tr key={dayKey(week[0] ?? month)}>
              {week.map((day) => {
                const key = dayKey(day);
                const outside = !isSameMonth(day, month);
                if (outside && !showOutsideDays) return <td key={key} role="gridcell" className={styles.cell} />;
                const selected = isSameDay(day, value);
                const isToday = isSameDay(day, today);
                const disabled = isDisabled(day);
                return (
                  <td key={key} role="gridcell" aria-selected={selected} className={styles.cell}>
                    <button
                      type="button"
                      tabIndex={key === focusKey ? 0 : -1}
                      aria-label={formatters.full.format(day)}
                      aria-current={isToday ? 'date' : undefined}
                      aria-disabled={disabled || undefined}
                      data-date={toISODate(day)}
                      data-outside={outside || undefined}
                      data-today={isToday || undefined}
                      data-pop={(selected && key === poppedKey) || undefined}
                      className={styles.day}
                      onClick={() => select(day)}
                    >
                      {formatters.day.format(day)}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
