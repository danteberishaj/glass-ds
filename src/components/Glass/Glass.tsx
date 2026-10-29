import type { ComponentPropsWithRef, ElementType } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Glass.module.css';

export type GlassIntensity = 'subtle' | 'regular' | 'strong';
export type GlassRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';

export type GlassProps = ComponentPropsWithRef<'div'> & {
  /** Element to render. Defaults to `div`. */
  as?: ElementType;
  /** How opaque and blurred the surface is. */
  intensity?: GlassIntensity;
  radius?: GlassRadius;
  elevation?: 'flat' | 'raised';
};

/**
 * The base translucent surface every other glass component is built on.
 * Server-component safe: no hooks, no event handlers of its own.
 */
export function Glass({
  as: Component = 'div',
  intensity = 'regular',
  radius = 'lg',
  elevation = 'flat',
  className,
  ...rest
}: GlassProps) {
  return (
    <Component
      data-intensity={intensity}
      data-radius={radius}
      data-elevation={elevation}
      className={cx(GLASS_CLASS, styles.root, className)}
      {...rest}
    />
  );
}
