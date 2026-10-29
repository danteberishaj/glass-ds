import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import styles from './Separator.module.css';

export type SeparatorOrientation = 'horizontal' | 'vertical';

export type SeparatorProps = Omit<ComponentPropsWithRef<'hr'>, 'children'> & {
  orientation?: SeparatorOrientation;
  /**
   * Purely visual (default): hidden from assistive tech with `role="none"`.
   * Set `false` when it divides content meaningfully: the native `<hr>` separator role, plus
   * `aria-orientation="vertical"` when vertical (horizontal is the default and stays implicit).
   */
  decorative?: boolean;
};

/** Thin divider line, a native `<hr>`. Hook-free (server-safe). */
export function Separator({ orientation = 'horizontal', decorative = true, className, ...rest }: SeparatorProps) {
  return (
    <hr
      role={decorative ? 'none' : undefined}
      aria-orientation={!decorative && orientation === 'vertical' ? 'vertical' : undefined}
      data-orientation={orientation}
      className={cx(styles.root, className)}
      {...rest}
    />
  );
}
