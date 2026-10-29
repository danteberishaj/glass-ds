import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import styles from './Spinner.module.css';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerTone = 'accent' | 'neutral' | 'current';

export type SpinnerProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** Read by screen readers (visually hidden). */
  label?: string;
  size?: SpinnerSize;
  /** `current` inherits the text colour, e.g. inside a Button. */
  tone?: SpinnerTone;
};

/**
 * Indeterminate loading indicator. `role="status"` with a visually hidden label.
 * Hook-free (server-safe). With reduced motion it pulses slowly instead of spinning.
 */
export function Spinner({ label = 'Loading', size = 'md', tone = 'accent', className, ...rest }: SpinnerProps) {
  return (
    <span role="status" data-size={size} data-tone={tone} className={cx(styles.root, className)} {...rest}>
      <span className={styles.ring} aria-hidden="true" />
      <span className={SR_ONLY_CLASS}>{label}</span>
    </span>
  );
}
