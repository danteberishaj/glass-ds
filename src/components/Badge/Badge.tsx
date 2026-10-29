import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Badge.module.css';

export type BadgeVariant = 'glass' | 'solid' | 'outline';
export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
export type BadgeSize = 'sm' | 'md';

export type BadgeProps = ComponentPropsWithRef<'span'> & {
  variant?: BadgeVariant;
  tone?: BadgeTone;
  size?: BadgeSize;
};

/**
 * Short status or metadata label. Non-interactive and hook-free (server-safe).
 * Colour is never the only signal: the text itself must carry the meaning.
 */
export function Badge({ variant = 'glass', tone = 'neutral', size = 'md', className, ...rest }: BadgeProps) {
  return (
    <span
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cx(variant === 'glass' && GLASS_CLASS, styles.root, className)}
      {...rest}
    />
  );
}
