import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Kbd.module.css';

export type KbdSize = 'sm' | 'md';

export type KbdProps = ComponentPropsWithRef<'kbd'> & {
  size?: KbdSize;
};

/**
 * A keyboard key as a small glass keycap. Native `<kbd>`, hook-free (server-safe).
 * For symbols (⌘, ⇧), add `title` or nearby text so the key name is clear, e.g.
 * `<Kbd title="Command">⌘</Kbd>`.
 */
export function Kbd({ size = 'md', className, ...rest }: KbdProps) {
  return <kbd data-size={size} className={cx(GLASS_CLASS, styles.root, className)} {...rest} />;
}
