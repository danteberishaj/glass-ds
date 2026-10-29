import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS, GLASS_SHEEN_CLASS } from '../../utils/glass';
import styles from './Button.module.css';

export type ButtonVariant = 'glass' | 'solid' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = ComponentPropsWithRef<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * Hook-free, so it renders in Server Components. Passing `onClick` still requires
 * the caller to be a Client Component — that is a Next.js rule, not ours.
 */
export function Button({ variant = 'glass', size = 'md', type = 'button', className, ...rest }: ButtonProps) {
  return (
    <button
      type={type}
      data-variant={variant}
      data-size={size}
      className={cx(variant === 'glass' && [GLASS_CLASS, GLASS_SHEEN_CLASS], styles.root, styles[variant], className)}
      {...rest}
    />
  );
}
