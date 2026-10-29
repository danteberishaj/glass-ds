'use client';

import { useEffect, useRef, type ComponentPropsWithRef, type ReactNode } from 'react';
import { FieldLabel, FieldMessages, fieldStyles, useFieldIds } from '../../internal/field';
import { cx } from '../../utils/cx';
import styles from './Checkbox.module.css';

export type CheckboxSize = 'sm' | 'md';

type CheckboxLabelProps =
  | { /** Visible label. Required unless `aria-label` is given. */ label: ReactNode }
  | { label?: undefined; 'aria-label': string };

/**
 * `className` and `style` go to the wrapper `<div>`; `ref` and every other prop go to the
 * native `<input type="checkbox">`.
 */
export type CheckboxProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'children'> &
  CheckboxLabelProps & {
    /** Visually hides the label (still announced). */
    hideLabel?: boolean;
    hint?: ReactNode;
    /** Error message. When set, the input is marked invalid and the message is announced. */
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
  hideLabel,
  hint,
  error,
  indeterminate = false,
  size = 'md',
  checked,
  required,
  onChange,
  id,
  className,
  style,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: CheckboxProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error, describedBy: ariaDescribedBy });
  // The caller owns the input's ref, so reach the input through our own root instead of merging refs.
  const rootRef = useRef<HTMLDivElement>(null);

  // A click clears the DOM's `indeterminate`, and React only re-applies `checked`: re-assert it after
  // every render that could follow a toggle (and in onChange below, for the same reason).
  useEffect(() => {
    const input = rootRef.current?.querySelector('input');
    if (input) input.indeterminate = indeterminate;
  }, [indeterminate, checked]);

  return (
    <div ref={rootRef} className={cx(fieldStyles.root, styles.root, className)} style={style} data-size={size}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="checkbox"
          className={styles.control}
          checked={checked}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
          onChange={(event) => {
            onChange?.(event);
            event.currentTarget.indeterminate = indeterminate;
          }}
        />
        {label != null && (
          <FieldLabel htmlFor={inputId} hidden={hideLabel} required={required} className={styles.label}>
            {label}
          </FieldLabel>
        )}
      </div>
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} className={styles.message} />
    </div>
  );
}
