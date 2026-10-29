'use client';

import {
  useId,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type ToggleEvent,
} from 'react';
import { useAnchoredPosition, type AnchoredPlacement } from '../../internal/useAnchoredPosition';
import { useClientEnvironment, warnServerRenderWithoutLocale } from '../../internal/useClientEnvironment';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import { Calendar } from '../Calendar';
import { toDay, toISODate, type WeekDay } from '../Calendar/date-utils';
import styles from './DatePicker.module.css';

/*
 * A field-looking trigger button + a native popover (`popover="auto"`) holding a Calendar.
 * The browser provides the top layer (no z-index, escapes glass containing blocks), light dismiss
 * and focus-return plumbing; useAnchoredPosition places it next to the field.
 * Client component: state, ids, effects.
 */

export type DatePickerProps = Omit<
  ComponentPropsWithRef<'button'>,
  'value' | 'defaultValue' | 'onChange' | 'children' | 'type' | 'name' | 'placeholder'
> & {
  /** Visible label. Required. */
  label: ReactNode;
  hint?: ReactNode;
  /** Error message. When set, the field is marked invalid and announces it. */
  error?: ReactNode;
  /** Selected day (controlled). */
  value?: Date | null;
  /** Initially selected day (uncontrolled). */
  defaultValue?: Date | null;
  /** Called with the picked day (pinned to local noon), or `null` when cleared (see `clearable`). */
  onValueChange?: (value: Date | null) => void;
  /**
   * Shows a "Clear date" button next to the value (only while a date is selected), and lets Backspace /
   * Delete on the focused trigger clear it. `onValueChange(null)` is only ever called by these.
   */
  clearable?: boolean;
  /** Accessible name of the clear button. */
  clearLabel?: string;
  /** Earliest selectable day (inclusive). */
  min?: Date | null;
  /** Latest selectable day (inclusive). */
  max?: Date | null;
  isDateDisabled?: (date: Date) => boolean;
  /**
   * BCP 47 tag for the field text and the calendar. Default: `<html lang>`, else the browser language, read on the
   * client after hydration. Pass one when server-rendering, so both sides agree.
   */
  locale?: string;
  weekStartsOn?: WeekDay;
  /** Shown when nothing is selected. */
  placeholder?: string;
  /** Shows a required marker on the label. Native constraint validation is not wired yet (hidden inputs can't be validated). */
  required?: boolean;
  /** Renders `<input type="hidden" name value="YYYY-MM-DD">` for native form submission. */
  name?: string;
  /** How the trigger shows the date. Default `{ dateStyle: 'medium' }` (e.g. "Oct 29, 2026"). */
  format?: Intl.DateTimeFormatOptions;
  /** Where the calendar opens. It flips vertically when there isn't room. Default `bottom-start`. */
  placement?: AnchoredPlacement;
  /** Accessible name of the calendar popover. */
  dialogLabel?: string;
};

const DEFAULT_FORMAT: Intl.DateTimeFormatOptions = { dateStyle: 'medium' };

/** Feature check at call time (never during render), so SSR and old browsers are safe. */
const supportsPopover = (el: HTMLElement | null): el is HTMLElement =>
  el !== null && typeof el.showPopover === 'function';

export function DatePicker({
  label,
  hint,
  error,
  value: valueProp,
  defaultValue = null,
  onValueChange,
  clearable = false,
  clearLabel = 'Clear date',
  min,
  max,
  isDateDisabled,
  locale,
  weekStartsOn,
  placeholder = 'Pick a date',
  disabled,
  required,
  name,
  format = DEFAULT_FORMAT,
  placement = 'bottom-start',
  dialogLabel = 'Choose date',
  id,
  className,
  onClick,
  onKeyDown,
  'aria-describedby': describedBy,
  ...rest
}: DatePickerProps) {
  const autoId = useId();
  const triggerId = id ?? autoId;
  const labelId = `${triggerId}-label`;
  const valueId = `${triggerId}-value`;
  const popoverId = `${triggerId}-popover`;
  const hintId = hint ? `${triggerId}-hint` : undefined;
  const errorId = error ? `${triggerId}-error` : undefined;

  // Private refs (the caller's `ref` goes to the trigger through ...rest; we don't merge refs).
  const fieldRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  /** Captured in `beforetoggle`: was focus inside when the popover started closing? */
  const focusWasInside = useRef(false);

  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue);
  const value = valueProp !== undefined ? valueProp : uncontrolledValue;
  const [open, setOpen] = useState(false);
  /** Bumped on every open: re-keys the Calendar so it shows the value's month and focuses a day. */
  const [openCount, setOpenCount] = useState(0);

  useAnchoredPosition(fieldRef, popoverRef, { open, placement });

  // Without `locale`, the field text is formatted with the client's language after hydration (the server
  // HTML uses the server's default; the dev warning below says so).
  const env = useClientEnvironment();
  warnServerRenderWithoutLocale('DatePicker', locale);
  const resolvedLocale = locale ?? env?.locale;
  const formatter = useMemo(() => new Intl.DateTimeFormat(resolvedLocale, format), [resolvedLocale, format]);
  const text = value ? formatter.format(value) : placeholder;
  const showClear = clearable && value !== null && !disabled;

  const getTrigger = () => fieldRef.current?.querySelector<HTMLButtonElement>('button') ?? null;

  function hide() {
    const el = popoverRef.current;
    if (supportsPopover(el)) {
      try {
        el.hidePopover();
      } catch {
        // Already hidden: older engines throw InvalidStateError instead of doing nothing.
      }
    } else {
      setOpen(false);
    }
  }

  // Popover-API browsers open through the trigger's `popovertarget` (native toggle and light-dismiss
  // exemption for the invoker). Older browsers: toggle our own state; CSS shows it via [data-open].
  function handleTriggerClick(event: MouseEvent<HTMLButtonElement>) {
    onClick?.(event);
    if (event.defaultPrevented || supportsPopover(popoverRef.current)) return;
    event.preventDefault();
    if (!open) setOpenCount((c) => c + 1);
    setOpen(!open);
  }

  function handleBeforeToggle(event: ToggleEvent<HTMLDivElement>) {
    if (event.newState === 'closed') {
      focusWasInside.current = event.currentTarget.contains(document.activeElement);
    }
  }

  // Fires after the browser opened/closed it (trigger, Esc, light dismiss, or our hide()).
  function handleToggle(event: ToggleEvent<HTMLDivElement>) {
    const isOpen = event.newState === 'open';
    if (isOpen) setOpenCount((c) => c + 1);
    setOpen(isOpen);
    if (!isOpen && focusWasInside.current) {
      focusWasInside.current = false;
      getTrigger()?.focus();
    }
  }

  // Esc is handled here rather than left to the close watcher, so it never reaches an enclosing
  // Dialog's Escape handler (which would close the dialog as well) and works without the API.
  function handlePopoverKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Escape' || event.defaultPrevented || event.nativeEvent.isComposing) return;
    event.preventDefault();
    event.stopPropagation();
    focusWasInside.current = true;
    hide();
    if (!supportsPopover(popoverRef.current)) getTrigger()?.focus();
  }

  // Tabbing out of the (non-modal) popover closes it. Clicks elsewhere are native light dismiss.
  function handlePopoverBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (!next || event.currentTarget.contains(next) || fieldRef.current?.contains(next)) return;
    hide();
  }

  function handleSelect(date: Date) {
    const day = toDay(date);
    if (valueProp === undefined) setUncontrolledValue(day);
    onValueChange?.(day);
    hide();
    if (!supportsPopover(popoverRef.current)) setOpen(false);
    getTrigger()?.focus();
  }

  function clear() {
    if (!showClear) return;
    if (valueProp === undefined) setUncontrolledValue(null);
    onValueChange?.(null);
    getTrigger()?.focus();
  }

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || !showClear || (event.key !== 'Backspace' && event.key !== 'Delete')) return;
    event.preventDefault();
    clear();
  }

  return (
    <div className={cx(styles.root, className)}>
      <label id={labelId} htmlFor={triggerId} className={styles.label}>
        {label}
        {required && (
          <span className={styles.required} aria-hidden="true">
            {' *'}
          </span>
        )}
      </label>
      <div ref={fieldRef} className={styles.field}>
        <button
          type="button"
          id={triggerId}
          disabled={disabled}
          popoverTarget={popoverId}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={popoverId}
          aria-labelledby={`${labelId} ${valueId}`}
          aria-describedby={cx(describedBy, hintId, errorId) || undefined}
          aria-invalid={error ? true : undefined}
          data-placeholder={value ? undefined : ''}
          data-clearable={showClear || undefined}
          className={cx(GLASS_CLASS, styles.trigger)}
          onClick={handleTriggerClick}
          onKeyDown={handleTriggerKeyDown}
          {...rest}
        >
          <span id={valueId} className={styles.value}>
            {text}
          </span>
          <span className={styles.icon} aria-hidden="true" />
        </button>
        {showClear && (
          // A sibling, not a child: buttons can't nest. Sits over the trigger's end padding.
          <button type="button" className={styles.clear} onClick={clear}>
            <svg className={styles.clearGlyph} viewBox="0 0 16 16" aria-hidden="true" focusable="false">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
            <span className={SR_ONLY_CLASS}>{clearLabel}</span>
          </button>
        )}
      </div>
      {name !== undefined && <input type="hidden" name={name} value={value ? toISODate(value) : ''} />}
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
      <div
        ref={popoverRef}
        id={popoverId}
        popover="auto"
        role="dialog"
        aria-modal="false"
        aria-label={dialogLabel}
        data-intensity="strong"
        data-open={open || undefined}
        className={cx(GLASS_CLASS, styles.popover)}
        onBeforeToggle={handleBeforeToggle}
        onToggle={handleToggle}
        onKeyDown={handlePopoverKeyDown}
        onBlur={handlePopoverBlur}
      >
        <Calendar
          key={openCount}
          surface="none"
          autoFocus={openCount > 0}
          value={value}
          onValueChange={handleSelect}
          min={min}
          max={max}
          isDateDisabled={isDateDisabled}
          locale={locale}
          weekStartsOn={weekStartsOn}
        />
      </div>
    </div>
  );
}
