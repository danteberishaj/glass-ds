'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Select.module.css';

export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'placeholder'> & {
  /** Visible label. Required. */
  label: ReactNode;
  hint?: ReactNode;
  /** Error message. When set, the select is marked invalid and announces it. */
  error?: ReactNode;
  /**
   * Renders a disabled, empty-valued first option that is selected until the user picks one.
   * Combine with `required` to make native validation reject it.
   */
  placeholder?: string;
};

/**
 * A native `<select>` styled like TextField, so autofill, mobile pickers and screen readers just work.
 * Children are `<option>`/`<optgroup>` elements. Client component: `useId` for label/hint/error ids.
 */
export function Select({
  label,
  hint,
  error,
  placeholder,
  id,
  className,
  children,
  'aria-describedby': describedBy,
  ...rest
}: SelectProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  // Uncontrolled with a placeholder and no default: start on the placeholder, not the first real option.
  const defaultValue =
    placeholder !== undefined && rest.value === undefined && rest.defaultValue === undefined && !rest.multiple
      ? ''
      : rest.defaultValue;

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.field}>
        <select
          id={inputId}
          className={cx(GLASS_CLASS, styles.input)}
          aria-invalid={error ? true : undefined}
          aria-describedby={cx(describedBy, hintId, errorId) || undefined}
          {...rest}
          defaultValue={defaultValue}
        >
          {placeholder !== undefined && (
            <option value="" disabled data-placeholder="">
              {placeholder}
            </option>
          )}
          {children}
        </select>
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
