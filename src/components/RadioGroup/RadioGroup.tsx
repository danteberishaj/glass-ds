'use client';

import {
  createContext,
  useContext,
  type ChangeEvent,
  type ComponentPropsWithRef,
  type ReactNode,
} from 'react';
import { FieldLabel, FieldMessages, fieldStyles, RequiredMark, useFieldIds } from '../../internal/field';
import { cx } from '../../utils/cx';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import styles from './RadioGroup.module.css';

export type RadioSize = 'sm' | 'md';
export type RadioGroupOrientation = 'vertical' | 'horizontal';

type RadioGroupContextValue = {
  name: string;
  /** `true` when the group was given a `value` prop (even `undefined`): every radio follows it. */
  controlled: boolean;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  invalid: boolean;
  size: RadioSize;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

/** `className`, `style`, `ref` and the other props go to the `<fieldset>`. */
export type RadioGroupProps = Omit<ComponentPropsWithRef<'fieldset'>, 'onChange' | 'defaultValue'> & {
  /** Rendered as the `<legend>`, which names the group. Required. Use `hideLabel` to keep it for screen readers only. */
  label: ReactNode;
  /** Visually hides the legend (still announced). */
  hideLabel?: boolean;
  /** Shared `name` for every radio. Defaults to a `useId` value. */
  name?: string;
  /**
   * Controlled selected value. Passing the prop at all (even as `undefined`, meaning "nothing selected")
   * makes the group controlled, so a form can start empty without a later uncontrolled→controlled switch.
   */
  value?: string;
  /** Initially selected value when uncontrolled. */
  defaultValue?: string;
  onValueChange?: (value: string, event: ChangeEvent<HTMLInputElement>) => void;
  orientation?: RadioGroupOrientation;
  size?: RadioSize;
  /** Sets `required` on every radio, so native form validation applies, and marks the legend. */
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
export function RadioGroup(props: RadioGroupProps) {
  const {
    label,
    hideLabel,
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
    'aria-describedby': ariaDescribedBy,
    ...rest
  } = props;
  const { inputId: groupId, hintId, errorId, describedBy } = useFieldIds({ id, hint, error, describedBy: ariaDescribedBy });

  const context: RadioGroupContextValue = {
    name: name ?? groupId,
    controlled: 'value' in props,
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
      className={cx(fieldStyles.root, styles.group, className)}
      data-size={size}
      data-orientation={orientation}
      aria-describedby={describedBy}
      {...rest}
    >
      <legend className={cx(styles.legend, hideLabel && SR_ONLY_CLASS)}>
        {label}
        {required && <RequiredMark />}
      </legend>
      {hint && (
        <span id={hintId} className={fieldStyles.hint}>
          {hint}
        </span>
      )}
      <div className={styles.items}>
        <RadioGroupContext.Provider value={context}>{children}</RadioGroupContext.Provider>
      </div>
      <FieldMessages error={error} hintId={undefined} errorId={errorId} />
    </fieldset>
  );
}

type RadioLabelProps =
  | { /** Visible label. Required unless `aria-label` is given. */ label: ReactNode }
  | { label?: undefined; 'aria-label': string };

/** `className` goes to the item wrapper; `ref` and the other props go to the native `<input type="radio">`. */
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
  'aria-describedby': ariaDescribedBy,
  ...rest
}: RadioProps) {
  const group = useContext(RadioGroupContext);
  const { inputId, hintId, describedBy } = useFieldIds({ id, hint, describedBy: ariaDescribedBy });

  const checkedProps = group?.controlled
    ? { checked: group.value === value }
    : group?.defaultValue !== undefined
      ? { defaultChecked: group.defaultValue === value }
      : {};

  return (
    <div className={cx(fieldStyles.root, styles.root, className)} data-size={group?.size ?? size ?? 'md'}>
      <div className={styles.row}>
        <input
          id={inputId}
          type="radio"
          className={styles.control}
          value={value}
          name={group?.name}
          required={group?.required}
          data-invalid={group?.invalid || undefined}
          aria-describedby={describedBy}
          {...checkedProps}
          {...rest}
          onChange={(event) => {
            onChange?.(event);
            if (event.target.checked) group?.onValueChange?.(value, event);
          }}
        />
        {label != null && (
          <FieldLabel htmlFor={inputId} className={styles.label}>
            {label}
          </FieldLabel>
        )}
      </div>
      <FieldMessages hint={hint} hintId={hintId} errorId={undefined} className={styles.message} />
    </div>
  );
}
