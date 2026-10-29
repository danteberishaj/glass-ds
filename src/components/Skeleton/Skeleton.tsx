import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { cx } from '../../utils/cx';
import styles from './Skeleton.module.css';

export type SkeletonRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export type SkeletonProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  /** CSS length; numbers are px. Defaults to 100%. */
  width?: number | string;
  /** CSS length; numbers are px. Defaults to one line of text. */
  height?: number | string;
  radius?: SkeletonRadius;
};

const toLength = (value: number | string | undefined) => (typeof value === 'number' ? `${value}px` : value);

/**
 * Loading placeholder with a shimmer. Always `aria-hidden`: announce loading once on the
 * container instead (e.g. `aria-busy="true"` or a `Spinner`). Hook-free (server-safe).
 */
export function Skeleton({ width, height, radius = 'md', className, style, ...rest }: SkeletonProps) {
  const sizing = {
    ...(width !== undefined && { '--_width': toLength(width) }),
    ...(height !== undefined && { '--_height': toLength(height) }),
  } as CSSProperties;

  return (
    <div
      aria-hidden="true"
      data-radius={radius}
      className={cx(styles.root, className)}
      style={{ ...sizing, ...style }}
      {...rest}
    />
  );
}
