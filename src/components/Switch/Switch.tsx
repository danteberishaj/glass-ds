'use client';

import type { ComponentPropsWithRef, ReactNode } from 'react';
import { FieldLabel, FieldMessages, fieldStyles, useFieldIds } from '../../internal/field';
import { cx } from '../../utils/cx';
import styles from './Switch.module.css';

export type SwitchSize = 'sm' | 'md';

type SwitchLabelProps =
  | { /** Visible label. Required unless `aria-label` is given. */ label: ReactNode }
  | { label?: undefined; 'aria-label': string };

/**
 * `className` and `style` go to the wrapper `<div>`; `ref` and every other prop go to the
 * native `<input type="checkbox" role="switch">`.
 */
export type SwitchProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'children' | 'role'> &
  SwitchLabelProps & {
    /** Visually hides the label (still announced). */
    hideLabel?: boolean;
    hint?: ReactNode;
    /** Error message. When set, the switch is marked invalid and the message is announced. */
    error?: ReactNode;
    size?: SwitchSize;
  };

/**
 * Native `<input type="checkbox" role="switch">`: Space toggles it, it submits with forms, and screen
 * readers announce "on/off". Use it for settings that apply immediately; use Checkbox inside forms
 * that are submitted. Client component: `useId` for label/hint/error ids.
 */
export function Switch({
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
}: SwitchProps) {
  const { inputId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error, describedBy: ariaDescribedBy });

  return (
    <div className={cx(fieldStyles.root, styles.root, className)} style={style} data-size={size}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className={styles.control}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          {...rest}
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
