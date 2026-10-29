import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_SHEEN_CLASS } from '../../utils/glass';
import { Glass, type GlassProps } from '../Glass';
import styles from './Card.module.css';

/*
 * Compound parts are separate named exports (CardHeader), not `Card.Header`.
 * Dot-notation properties are lost across the React Server Component boundary.
 */

export type CardProps = GlassProps & {
  /**
   * Hover lift, raised shadow and a sheen sweep, for cards that are (or wrap) one link or action.
   * Purely visual: it sets `data-interactive`, so Card stays server-safe. Make the card's content
   * focusable/clickable yourself (e.g. a link inside it).
   */
  interactive?: boolean;
};

export function Card({ className, intensity = 'regular', radius = 'xl', interactive = false, ...rest }: CardProps) {
  return (
    <Glass
      intensity={intensity}
      radius={radius}
      data-interactive={interactive || undefined}
      className={cx(styles.root, interactive && GLASS_SHEEN_CLASS, className)}
      {...rest}
    />
  );
}

export type CardHeaderProps = ComponentPropsWithRef<'div'>;
export function CardHeader({ className, ...rest }: CardHeaderProps) {
  return <div className={cx(styles.header, className)} {...rest} />;
}

export type CardTitleProps = ComponentPropsWithRef<'h3'> & {
  /** Heading level, so the card fits the page outline. Defaults to `h3`. */
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
};
export function CardTitle({ as: Heading = 'h3', className, ...rest }: CardTitleProps) {
  return <Heading className={cx(styles.title, className)} {...rest} />;
}

export type CardDescriptionProps = ComponentPropsWithRef<'p'>;
export function CardDescription({ className, ...rest }: CardDescriptionProps) {
  return <p className={cx(styles.description, className)} {...rest} />;
}

export type CardContentProps = ComponentPropsWithRef<'div'>;
export function CardContent({ className, ...rest }: CardContentProps) {
  return <div className={cx(styles.content, className)} {...rest} />;
}

export type CardFooterProps = ComponentPropsWithRef<'div'>;
export function CardFooter({ className, ...rest }: CardFooterProps) {
  return <div className={cx(styles.footer, className)} {...rest} />;
}
