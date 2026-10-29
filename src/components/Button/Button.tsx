import type { ComponentPropsWithRef } from 'react';
import type { Size } from '../../types';
import { cx } from '../../utils/cx';
import { GLASS_CLASS, GLASS_SHEEN_CLASS } from '../../utils/glass';
import { Spinner } from '../Spinner';
import styles from './Button.module.css';

export type ButtonVariant = 'glass' | 'solid' | 'ghost';
export type ButtonSize = Size;

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /**
   * Shows a spinner before the children and blocks `onClick`, without removing the button from the
   * tab order (`aria-disabled` + `aria-busy`, not `disabled`), so focus stays put while a request runs.
   */
  loading?: boolean;
};

/**
 * Hook-free, so it renders in Server Components. Passing `onClick` still requires
 * the caller to be a Client Component — that is a Next.js rule, not ours.
 */
export function Button({
  variant = 'glass',
  size = 'md',
  type = 'button',
  loading = false,
  className,
  children,
  onClick,
  'aria-disabled': ariaDisabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      aria-disabled={loading ? true : ariaDisabled}
      className={cx(variant === 'glass' && [GLASS_CLASS, GLASS_SHEEN_CLASS], styles.root, styles[variant], className)}
      onClick={loading ? undefined : onClick}
      {...rest}
    >
      {/* The button's text already says what is happening, and aria-busy carries the state. */}
      {loading && <Spinner size="sm" tone="current" aria-hidden="true" />}
      {children}
    </button>
  );
}
