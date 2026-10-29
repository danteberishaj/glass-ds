'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { FieldLabel, FieldMessages, fieldStyles, useFieldIds } from '../../internal/field';
import type { Size } from '../../types';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Textarea.module.css';

export type TextareaResize = 'none' | 'vertical' | 'both';
export type TextareaSize = Size;

/**
 * `className` and `style` go to the wrapper `<div>`; `ref` and every other prop go to the
 * native `<textarea>`.
 */
export type TextareaProps = Omit<ComponentPropsWithRef<'textarea'>, 'children'> & {
  /** Visible label. Required: placeholders are not labels. Use `hideLabel` to keep it for screen readers only. */
  label: ReactNode;
  /** Visually hides the label (still announced). */
  hideLabel?: boolean;
  hint?: ReactNode;
  /** Error message. When set, the textarea is marked invalid and the message is announced. */
  error?: ReactNode;
  /** Which way the user can resize it. Defaults to `vertical`. */
  resize?: TextareaResize;
  /** Padding and type size, matching TextField's heights (`--gds-control-height-*`). Defaults to `md`. */
  size?: TextareaSize;
};

/** Same API and look as TextField. Client component: `useId` for label/hint/error ids. */
export function Textarea({
  label,
  hideLabel,
  hint,
  error,
  resize = 'vertical',
  size = 'md',
  rows = 3,
  required,
  id,
  className,
  style,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: TextareaProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error, describedBy: ariaDescribedBy });

  return (
    <div className={cx(fieldStyles.root, className)} style={style}>
      <FieldLabel htmlFor={inputId} hidden={hideLabel} required={required}>
        {label}
      </FieldLabel>
      <textarea
        id={inputId}
        rows={rows}
        required={required}
        data-resize={resize}
        data-size={size}
        className={cx(GLASS_CLASS, styles.input)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...rest}
      />
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
