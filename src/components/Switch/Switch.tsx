'use client';

import { useId, type ComponentPropsWithRef, type ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './Switch.module.css';

export type SwitchSize = 'sm' | 'md';

type SwitchLabelProps =
  | { /** Visible label. Required unless `aria-label` is given. */ label: ReactNode }
  | { label?: undefined; 'aria-label': string };

export type SwitchProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'children' | 'role'> &
  SwitchLabelProps & {
    hint?: ReactNode;
    size?: SwitchSize;
  };

/**
 * Native `<input type="checkbox" role="switch">`: Space toggles it, it submits with forms, and screen
 * readers announce "on/off". Use it for settings that apply immediately; use Checkbox inside forms
 * that are submitted. Client component: `useId` for label/hint ids.
 */
export function Switch({ label, hint, size = 'md', id, className, 'aria-describedby': describedBy, ...rest }: SwitchProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  return (
    <div className={cx(styles.root, className)} data-size={size}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className={styles.control}
          aria-describedby={cx(describedBy, hintId) || undefined}
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
    </div>
  );
}
