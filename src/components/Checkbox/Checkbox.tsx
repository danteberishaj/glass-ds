'use client';

import { useEffect, useId, useRef, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'sm' | 'md';

type CheckboxLabelProps =
  | { /** Visible label. Required unless `aria-label` is given. */ label: ReactNode }
  | { label?: undefined; 'aria-label': string };

export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'children'> &
  CheckboxLabelProps & {
    hint?: ReactNode;
    /** Error message. When set, the input is marked invalid and announces it. */
    error?: ReactNode;
    /** Shows a dash and is announced as "mixed". Purely visual state: it does not change `checked`. */
    indeterminate?: boolean;
    size?: CheckboxSize;
  };

/**
 * Native `<input type="checkbox">` with a CSS-drawn box, so forms, validation and screen readers just work.
 * Client component: `useId` for ids, and an effect for `indeterminate` (a DOM property, not an attribute).
 */
export function Checkbox({
  label,
  hint,
  error,
  indeterminate = false,
  size = 'md',
  id,
  className,
  'aria-describedby': describedBy,
  ...rest
}: CheckboxProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  // The caller owns the input's ref, so reach the input through our own root instead of merging refs.
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const input = rootRef.current?.querySelector('input');
    if (input) input.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div ref={rootRef} className={cx(styles.root, className)} data-size={size}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.control}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(describedBy, hintId, errorId) || undefined}
          {...rest}
        />
        {label != null && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
      </div>
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
    </div>
  );
}
