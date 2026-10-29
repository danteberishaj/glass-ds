'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { FieldLabel, FieldMessages, fieldStyles, useFieldIds } from '../../internal/field';
import type { Size } from '../../types';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './TextField.module.css';

export type TextFieldSize = Size;

/**
 * `className` and `style` go to the wrapper `<div>`; `ref` and every other prop go to the
 * native `<input>`.
 */
export type TextFieldProps = Omit<ComponentPropsWithRef<'input'>, 'children' | 'size'> & {
  /** Visible label. Required: placeholders are not labels. Use `hideLabel` to keep it for screen readers only. */
  label: ReactNode;
  /** Visually hides the label (still announced). */
  hideLabel?: boolean;
  hint?: ReactNode;
  /** Error message. When set, the input is marked invalid and the message is announced. */
  error?: ReactNode;
  /** Control height (`--gds-control-height-*`). Defaults to `md`. */
  size?: TextFieldSize;
};

/** Client component: uses `useId` so label/hint/error ids match between server and client. */
export function TextField({
  label,
  hideLabel,
  hint,
  error,
  size = 'md',
  required,
  id,
  className,
  style,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: TextFieldProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error, describedBy: ariaDescribedBy });

  return (
    <div className={cx(fieldStyles.root, className)} style={style}>
      <FieldLabel htmlFor={inputId} hidden={hideLabel} required={required}>
        {label}
      </FieldLabel>
      <input
        id={inputId}
        required={required}
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
