/**
 * Shared chassis for form fields: id wiring (label / hint / error), the label with its optional
 * required marker, and the hint + error messages. No `'use client'` here on purpose: `useFieldIds`
 * is only called from the client form components, and the two components are hook-free.
 */
import type { ReactNode } from 'react';
import { useId } from 'react';
import { cx } from '../utils/cx';
import { SR_ONLY_CLASS } from '../utils/sr-only';
import styles from './field.module.css';

export const fieldStyles = styles;

export type FieldIdsInput = {
  /** Caller-provided id for the control; otherwise a `useId` value. */
  id?: string;
  hint?: ReactNode;
  error?: ReactNode;
  /** The caller's own `aria-describedby`, merged in front of the hint and error ids. */
  describedBy?: string;
};

export type FieldIds = {
  inputId: string;
  hintId: string | undefined;
  errorId: string | undefined;
  /** Merged `aria-describedby` value, or `undefined` when there is nothing to describe. */
  describedBy: string | undefined;
};

/** Derives the control, hint and error ids and the merged `aria-describedby` for a field. */
export function useFieldIds({ id, hint, error, describedBy }: FieldIdsInput): FieldIds {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return { inputId, hintId, errorId, describedBy: cx(describedBy, hintId, errorId) || undefined };
}

/** The `*` after a required label. Hidden from assistive tech: the native `required` attribute speaks. */
export function RequiredMark() {
  return (
    <span className={styles.required} aria-hidden="true">
      *
    </span>
  );
}

export type FieldLabelProps = {
  htmlFor: string;
  children: ReactNode;
  /** Keep the label for screen readers only (`SR_ONLY_CLASS`). */
  hidden?: boolean;
  /** Append the required marker. */
  required?: boolean;
  className?: string;
};

export function FieldLabel({ htmlFor, children, hidden, required, className }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={cx(styles.label, className, hidden && SR_ONLY_CLASS)}>
      {children}
      {required && <RequiredMark />}
    </label>
  );
}

export type FieldMessagesProps = {
  hint?: ReactNode;
  error?: ReactNode;
  hintId: string | undefined;
  errorId: string | undefined;
  /** Extra class for both messages (e.g. an inset to line up with a label next to a box). */
  className?: string;
};

/**
 * Hint and error text. The error is a polite live region, so an error that appears after a submit
 * is announced without moving focus.
 */
export function FieldMessages({ hint, error, hintId, errorId, className }: FieldMessagesProps) {
  return (
    <>
      {hint && (
        <span id={hintId} className={cx(styles.hint, className)}>
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className={cx(styles.error, className)} aria-live="polite">
          {error}
        </span>
      )}
    </>
  );
}
