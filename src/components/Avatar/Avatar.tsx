import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Avatar.module.css';
import { AvatarImage, type AvatarImageProps } from './AvatarImage';

export type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

export type AvatarProps = Omit<ComponentPropsWithRef<'span'>, 'children'> & {
  /** Image URL. Without it (or when it fails to load) the initials fallback shows. */
  src?: string;
  /**
   * Who or what the avatar shows, e.g. the person's name. Becomes the accessible name.
   * Pass `""` when a visible name sits next to the avatar, so it isn't read twice.
   */
  alt: string;
  /** Fallback content. Defaults to initials derived from `alt`. */
  fallback?: ReactNode;
  size?: AvatarSize;
  /** Extra attributes for the `<img>` (e.g. `referrerPolicy`, `crossOrigin`). */
  imageProps?: Omit<AvatarImageProps, 'src'>;
};

/** First code point of a word, so astral characters (emoji, some CJK) are not cut in half. */
const firstChar = (word: string | undefined) => (word ? (Array.from(word)[0] ?? '') : '');

/** "Ada Lovelace" → "AL", "plato" → "P", "𝔄da" → "𝔄". */
export function getInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = firstChar(words[0]);
  const last = words.length > 1 ? firstChar(words.at(-1)) : '';
  return (first + last).toUpperCase();
}

/**
 * Server shell: the glass ring and the initials are server-rendered; only the `<img>` is a
 * client component (it needs state to fall back when loading fails).
 *
 * The root is `role="img"` named by `alt`, so the name is announced the same way whether the
 * photo or the initials are showing.
 */
export function Avatar({ src, alt, fallback, size = 'md', imageProps, className, ...rest }: AvatarProps) {
  const labelled = alt.trim() !== '';
  return (
    <span
      role={labelled ? 'img' : undefined}
      aria-label={labelled ? alt : undefined}
      aria-hidden={labelled ? undefined : true}
      data-size={size}
      className={cx(GLASS_CLASS, styles.root, className)}
      {...rest}
    >
      <span className={styles.content}>
        {src && <AvatarImage key={src} src={src} {...imageProps} />}
        <span className={styles.fallback} aria-hidden="true">
          {fallback ?? getInitials(alt)}
        </span>
      </span>
    </span>
  );
}
