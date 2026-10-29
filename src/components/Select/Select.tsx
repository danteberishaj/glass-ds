'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { FieldLabel, FieldMessages, fieldStyles, useFieldIds } from '../../internal/field';
import type { Size } from '../../types';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Select.module.css';

export type SelectSize = Size;

/**
 * `className` and `style` go to the wrapper `<div>`; `ref` and every other prop go to the
 * native `<select>`. The native `size` attribute (visible rows) is replaced by the control height;
 * use `multiple` for a list box.
 */
export type SelectProps = Omit<ComponentPropsWithRef<'select'>, 'placeholder' | 'size'> & {
  /** Visible label. Required. Use `hideLabel` to keep it for screen readers only. */
  label: ReactNode;
  /** Visually hides the label (still announced). */
  hideLabel?: boolean;
  hint?: ReactNode;
  /** Error message. When set, the select is marked invalid and the message is announced. */
  error?: ReactNode;
  /**
   * Renders a disabled, empty-valued first option that is selected until the user picks one.
   * Combine with `required` to make native validation reject it.
   */
  placeholder?: string;
  /** Control height (`--gds-control-height-*`). Defaults to `md`. */
  size?: SelectSize;
};

/**
 * A native `<select>` styled like TextField, so autofill, mobile pickers and screen readers just work.
 * Children are `<option>`/`<optgroup>` elements. Client component: `useId` for label/hint/error ids.
 */
export function Select({
  label,
  hideLabel,
  hint,
  error,
  placeholder,
  size = 'md',
  required,
  id,
  className,
  style,
  children,
  'aria-describedby': ariaDescribedBy,
  ...rest
}: SelectProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error, describedBy: ariaDescribedBy });
  // Uncontrolled with a placeholder and no default: start on the placeholder, not the first real option.
  const defaultValue =
    placeholder !== undefined && rest.value === undefined && rest.defaultValue === undefined && !rest.multiple
      ? ''
      : rest.defaultValue;

  return (
    <div className={cx(fieldStyles.root, className)} style={style}>
      <FieldLabel htmlFor={inputId} hidden={hideLabel} required={required}>
        {label}
      </FieldLabel>
      <div className={styles.field}>
        <select
          id={inputId}
          required={required}
          data-size={size}
          className={cx(GLASS_CLASS, styles.input)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
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
      <FieldMessages hint={hint} error={error} hintId={hintId} errorId={errorId} />
    </div>
  );
}
