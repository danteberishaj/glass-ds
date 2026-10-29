import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '../../utils/cx';
import styles from './Progress.module.css';

export type ProgressTone = 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type ProgressSize = 'sm' | 'md' | 'lg';

export type ProgressProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** Current value. `null`/omitted = indeterminate (unknown duration). */
  value?: number | null;
  min?: number;
  max?: number;
  /**
   * Visible label, also used as the accessible name. Without it, pass `aria-label`
   * or `aria-labelledby`.
   */
  label?: string;
  /** Show the percentage next to the label (determinate only). */
  showValue?: boolean;
  /** Human-readable value for screen readers, e.g. "3 of 8 files". Sets `aria-valuetext`. */
  valueText?: string;
  tone?: ProgressTone;
  size?: ProgressSize;
};

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/**
 * Progress bar. Hook-free (server-safe): the whole element is the `progressbar`, so the visible
 * label inside it needs no id (progressbar children are presentational; the name comes from
 * `aria-label`).
 */
export function Progress({
  value,
  min = 0,
  max = 100,
  label,
  showValue = false,
  valueText,
  tone = 'accent',
  size = 'md',
  className,
  style,
  'aria-label': ariaLabel,
  ...rest
}: ProgressProps) {
  const indeterminate = value === null || value === undefined || !Number.isFinite(value);
  const range = max > min ? max - min : 1;
  const current = indeterminate ? undefined : clamp(value, min, max);
  const ratio = current === undefined ? 0 : (current - min) / range;
  const percent = `${Math.round(ratio * 100)}%`;

  return (
    <div
      role="progressbar"
      aria-label={ariaLabel ?? label}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={current}
      aria-valuetext={indeterminate ? undefined : valueText}
      data-state={indeterminate ? 'indeterminate' : 'determinate'}
      data-tone={tone}
      data-size={size}
      className={cx(styles.root, className)}
      style={{ '--_progress': ratio, ...style } as CSSProperties}
      {...rest}
    >
      {(label || (showValue && !indeterminate)) && (
        <div className={styles.header}>
          {label && <span className={styles.label}>{label}</span>}
          {showValue && !indeterminate && <span className={styles.value}>{percent}</span>}
        </div>
      )}
      <div className={styles.track}>
        <div className={styles.indicator} />
      </div>
    </div>
  );
}
