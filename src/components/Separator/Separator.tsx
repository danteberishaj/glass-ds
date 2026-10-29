import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import styles from './Separator.module.css';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export type SeparatorProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  orientation?: SeparatorOrientation;
  /**
   * Purely visual (default): hidden from assistive tech with `role="none"`.
   * Set `false` when it divides content meaningfully (`role="separator"`).
   */
  decorative?: boolean;
};

/** Thin divider line. Hook-free (server-safe). */
export function Separator({ orientation = 'horizontal', decorative = true, className, ...rest }: SeparatorProps) {
  return (
    <div
      role={decorative ? 'none' : 'separator'}
      aria-orientation={decorative ? undefined : orientation}
      data-orientation={orientation}
      className={cx(styles.root, className)}
      {...rest}
    />
  );
}
