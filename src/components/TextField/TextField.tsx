'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './TextField.module.css';

export type TextFieldProps = Omit<ComponentPropsWithRef<'input'>, 'children'> & {
  /** Visible label. Required: placeholders are not labels. */
  label: ReactNode;
  hint?: ReactNode;
  /** Error message. When set, the input is marked invalid and announces it. */
  error?: ReactNode;
};

/** Client component: uses `useId` so label/hint/error ids match between server and client. */
export function TextField({ label, hint, error, id, className, 'aria-describedby': describedBy, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <input
        id={inputId}
        className={cx(GLASS_CLASS, styles.input)}
        aria-invalid={error ? true : undefined}
        aria-describedby={cx(describedBy, hintId, errorId) || undefined}
        {...rest}
      />
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
