'use client';

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { FieldLabel, FieldMessages, fieldStyles, useFieldIds } from '../../internal/field';
import { cx } from '../../utils/cx';
import styles from './Slider.module.css';

/**
 * `className` and `style` go to the wrapper `<div>`; `ref` and every other prop go to the
 * native `<input type="range">`.
 */
export type SliderProps = Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'size' | 'children' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
> & {
    /** Visible label. Required: a slider without a name is unusable with a screen reader. Use `hideLabel` to keep it for screen readers only. */
    label: ReactNode;
    /** Visually hides the label (still announced). */
    hideLabel?: boolean;
    /** Controlled value. */
    value?: number;
    /** Initial value when uncontrolled. Defaults to the midpoint, like a native range input. */
    defaultValue?: number;
    onValueChange?: (value: number, event: ChangeEvent<HTMLInputElement>) => void;
    min?: number;
    max?: number;
    step?: number;
    /** Shows the current value next to the label. */
    showValue?: boolean;
    /** Formats the visible value and sets `aria-valuetext` (e.g. `(v) => \`${v}%\``). */
    formatValue?: (value: number) => string;
    hint?: ReactNode;
    /** Error message. When set, the slider is marked invalid and the message is announced. */
    error?: ReactNode;
  };

function midpoint(min: number, max: number, step: number) {
  if (max <= min) return min;
  return min + Math.round((max - min) / 2 / step) * step;
}

/**
 * Native `<input type="range">`: keyboard (arrows, Page Up/Down, Home/End), forms and screen readers
 * work as usual. Client component: it tracks the value in state so the accent fill (`--_progress`)
 * follows the thumb in WebKit/Blink, which have no native progress pseudo-element.
 */
export function Slider({
  label,
  hideLabel,
  hint,
  error,
  value,
  defaultValue,
  onValueChange,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  formatValue,
  required,
  id,
  className,
  style,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: SliderProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error, describedBy: ariaDescribedBy });
  const rootRef = useRef<HTMLDivElement>(null);
  const [initial] = useState(() => defaultValue ?? midpoint(min, max, step));
  const [inner, setInner] = useState(initial);
  const controlled = value !== undefined;
  const current = controlled ? value : inner;
  const progress = max > min ? (Math.min(Math.max(current, min), max) - min) / (max - min) : 0;
  const display = formatValue ? formatValue(current) : String(current);

  // Uncontrolled: a form reset restores the input's default value, so the fill must follow.
  useEffect(() => {
    if (controlled) return;
    const form = rootRef.current?.querySelector('input')?.form;
    if (!form) return;
    const onReset = () => setInner(initial);
    form.addEventListener('reset', onReset);
    return () => form.removeEventListener('reset', onReset);
  }, [controlled, initial]);

  return (
    <div ref={rootRef} className={cx(fieldStyles.root, className)} style={style}>
      <div className={styles.header}>
        <FieldLabel htmlFor={inputId} hidden={hideLabel} required={required}>
          {label}
        </FieldLabel>
        {showValue && (
          // The slider itself announces its value; the output is a visual duplicate.
          <output htmlFor={inputId} className={styles.value} aria-hidden="true">
            {display}
          </output>
        )}
      </div>
      <input
        id={inputId}
        type="range"
        min={min}
        max={max}
        step={step}
        required={required}
        className={styles.input}
        style={{ '--_progress': progress } as CSSProperties}
        aria-valuetext={formatValue ? display : undefined}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...(controlled ? { value } : { defaultValue: initial })}
        {...rest}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          if (!controlled) setInner(next);
          onChange?.(event);
          onValueChange?.(next, event);
        }}
      />
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
