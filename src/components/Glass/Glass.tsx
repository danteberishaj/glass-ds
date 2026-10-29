import type { ElementType } from 'react';
import type { PolymorphicProps } from '../../internal/polymorphic';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Glass.module.css';

export type GlassIntensity = 'subtle' | 'regular' | 'strong';
export type GlassRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type GlassElevation = 'flat' | 'raised';

export type GlassOwnProps = {
  /** How opaque and blurred the surface is. */
  intensity?: GlassIntensity;
  radius?: GlassRadius;
  elevation?: GlassElevation;
};

/**
 * Props of a Glass rendered as `T` (default `div`): the element's own props (`href` for `as="a"`,
 * `aria-label` for `as="section"`…) plus the glass options. `GlassProps` with no argument is the
 * `div` variant, which Card and Accordion build on.
 */
export type GlassProps<T extends ElementType = 'div'> = PolymorphicProps<T, GlassOwnProps>;

/**
 * The base translucent surface every other glass component is built on.
 * Server-component safe: no hooks, no event handlers of its own.
 */
export function Glass<T extends ElementType = 'div'>({
  as,
  intensity = 'regular',
  radius = 'lg',
  elevation = 'flat',
  className,
  ...rest
}: GlassProps<T>) {
  const Component: ElementType = as ?? 'div';
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
