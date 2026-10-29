'use client';

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import styles from './Slider.module.css';

export type SliderProps = Omit<
  ComponentPropsWithRef<'input'>,
  'type' | 'size' | 'children' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
> & {
    /** Visible label. Required: a slider without a name is unusable with a screen reader. */
    label: ReactNode;
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
  hint,
  value,
  defaultValue,
  onValueChange,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showValue = false,
  formatValue,
  id,
  className,
  style,
  'aria-describedby': describedBy,
  ...rest
}: SliderProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
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
    <div ref={rootRef} className={cx(styles.root, className)}>
      <div className={styles.header}>
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
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
        className={styles.input}
        style={{ ...style, '--_progress': progress } as CSSProperties}
        aria-valuetext={formatValue ? display : undefined}
        aria-describedby={cx(describedBy, hintId) || undefined}
        {...(controlled ? { value } : { defaultValue: initial })}
        {...rest}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          if (!controlled) setInner(next);
          onChange?.(event);
          onValueChange?.(next, event);
        }}
      />
      {hint && (
        <span id={hintId} className={styles.hint}>
          {hint}
        </span>
      )}
    </div>
  );
}
