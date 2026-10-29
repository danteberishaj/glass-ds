'use client';

import {
  createContext,
  useContext,
  useId,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { cx } from '../../utils/cx';
import styles from './RadioGroup.module.css';

export type RadioSize = 'sm' | 'md';
export type RadioGroupOrientation = 'vertical' | 'horizontal';

type RadioGroupContextValue = {
  name: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  invalid: boolean;
  size: RadioSize;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export type RadioGroupProps = Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'defaultValue'> & {
  /** Rendered as the `<legend>`, which names the group. Required. */
  label: ReactNode;
  /** Shared `name` for every radio. Defaults to a `useId` value. */
  name?: string;
  /** Controlled selected value. */
  value?: string;
  /** Initially selected value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  orientation?: RadioGroupOrientation;
  size?: RadioSize;
  /** Sets `required` on every radio, so native form validation applies. */
  required?: boolean;
  hint?: ReactNode;
  /** Error message, linked to the group through aria-describedby. */
  error?: ReactNode;
};

/**
 * `<fieldset>` + `<legend>` around native radios sharing one `name`. Arrow keys, roving focus and form
 * submission come from the browser. `disabled` on the fieldset disables every radio natively.
 * Client component: context passes name/value to `Radio`.
 */
export function RadioGroup({
  label,
  name,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  size = 'md',
  required,
  hint,
  error,
  id,
  className,
  children,
  'aria-describedby': describedBy,
  ...rest
}: RadioGroupProps) {
  const autoId = useId();
  const groupId = id ?? autoId;
  const hintId = hint ? `${groupId}-hint` : undefined;
  const errorId = error ? `${groupId}-error` : undefined;

  const context: RadioGroupContextValue = {
    name: name ?? groupId,
    value,
    defaultValue,
    onValueChange,
    required,
    invalid: Boolean(error),
    size,
  };

  return (
    <fieldset
      id={groupId}
      className={cx(styles.group, className)}
      data-size={size}
      data-orientation={orientation}
      aria-describedby={cx(describedBy, hintId, errorId) || undefined}
      {...rest}
    >
      <legend className={styles.legend}>{label}</legend>
      {hint && (
        <span id={hintId} className={styles.groupHint}>
          {hint}
        </span>
      )}
      <div className={styles.items}>
        <RadioGroupContext.Provider value={context}>{children}</RadioGroupContext.Provider>
      </div>
      {error && (
        <span id={errorId} className={styles.error}>
          {error}
        </span>
      )}
    </fieldset>
  );
}

type RadioLabelProps =
  | { /** Visible label. Required unless `aria-label` is given. */ label: ReactNode }
  | { label?: undefined; 'aria-label': string };

export type RadioProps = Omit<ComponentPropsWithRef<'input'>, 'type' | 'size' | 'children' | 'value'> &
  RadioLabelProps & {
    value: string;
    hint?: ReactNode;
    /** Only used outside a RadioGroup; inside one, the group's size wins. */
    size?: RadioSize;
  };

/** Native `<input type="radio">`. Inside `RadioGroup` it takes `name`, checked state and size from the group. */
export function Radio({
  label,
  hint,
  value,
  size,
  id,
  className,
  onChange,
  'aria-describedby': describedBy,
  ...rest
}: RadioProps) {
  const group = useContext(RadioGroupContext);
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;

  const checkedProps =
    group?.value !== undefined
      ? { checked: group.value === value }
      : group?.defaultValue !== undefined
        ? { defaultChecked: group.defaultValue === value }
        : {};

  return (
    <div className={cx(styles.root, className)} data-size={group?.size ?? size ?? 'md'}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="radio"
          className={styles.control}
          value={value}
          name={group?.name}
          required={group?.required}
          data-invalid={group?.invalid || undefined}
          aria-describedby={cx(describedBy, hintId) || undefined}
          {...checkedProps}
          {...rest}
          onChange={(event) => {
            onChange?.(event);
            if (event.target.checked) group?.onValueChange?.(value, event);
          }}
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
