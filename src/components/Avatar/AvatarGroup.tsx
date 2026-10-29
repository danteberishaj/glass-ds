import { Children, cloneElement, isValidElement, type ComponentPropsWithRef, type ReactElement } from 'react';
import { cx } from '../../utils/cx';
import { Avatar, type AvatarProps, type AvatarSize } from './Avatar';
import styles from './Avatar.module.css';

export type AvatarGroupProps = ComponentPropsWithRef<'div'> & {
  /** Show at most this many avatars, then a "+N" chip for the rest. */
  max?: number;
  /** Size for every avatar that doesn't set its own, and for the "+N" chip. */
  size?: AvatarSize;
  /** Accessible name of the "+N" chip. Defaults to "N more". */
  overflowLabel?: (hidden: number) => string;
};

/** Overlapping stack of `Avatar`s. Hook-free (server-safe). */
export function AvatarGroup({
  max,
  size = 'md',
  overflowLabel = (hidden) => `${hidden} more`,
  className,
  children,
  ...rest
}: AvatarGroupProps) {
  const items = Children.toArray(children).filter(isValidElement) as ReactElement<AvatarProps>[];
  const limit = max !== undefined && max >= 0 && max < items.length ? max : items.length;
  const hidden = items.length - limit;

  return (
    <div data-size={size} className={cx(styles.group, className)} {...rest}>
      {items
        .slice(0, limit)
        .map((child) => (child.props.size ? child : cloneElement(child, { size })))}
      {hidden > 0 && (
        <Avatar alt={overflowLabel(hidden)} fallback={`+${hidden}`} size={size} className={styles.overflow} />
      )}
    </div>
  );
}
