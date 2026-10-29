'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Textarea.module.css';

export type TextareaResize = 'none' | 'vertical' | 'both';

export type TextareaProps = Omit<ComponentPropsWithRef<'textarea'>, 'children'> & {
  /** Visible label. Required: placeholders are not labels. */
  label: ReactNode;
  hint?: ReactNode;
  /** Error message. When set, the textarea is marked invalid and announces it. */
  error?: ReactNode;
  /** Which way the user can resize it. Defaults to `vertical`. */
  resize?: TextareaResize;
};

/** Same API and look as TextField. Client component: `useId` for label/hint/error ids. */
export function Textarea({
  label,
  hint,
  error,
  resize = 'vertical',
  rows = 3,
  id,
  className,
  'aria-describedby': describedBy,
  ...rest
}: TextareaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className={cx(styles.root, className)}>
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <textarea
        id={inputId}
        rows={rows}
        data-resize={resize}
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
