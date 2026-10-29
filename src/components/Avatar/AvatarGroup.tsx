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
  const items = Children.toArray(children).filter(isValidElement);
  const limit = max !== undefined && max >= 0 && max < items.length ? max : items.length;
  const hidden = items.length - limit;
  // Only an Avatar understands `size`; anything else (a wrapper, a custom chip) renders untouched.
  const isAvatar = (el: ReactElement): el is ReactElement<AvatarProps> => el.type === Avatar;

  return (
    <div data-size={size} className={cx(styles.group, className)} {...rest}>
      {items
        .slice(0, limit)
        .map((child) => (isAvatar(child) && !child.props.size ? cloneElement(child, { size }) : child))}
      {hidden > 0 && (
        <Avatar alt={overflowLabel(hidden)} fallback={`+${hidden}`} size={size} className={styles.overflow} />
      )}
    </div>
  );
}
