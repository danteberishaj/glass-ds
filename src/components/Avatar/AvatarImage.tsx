'use client';

import { useState, type ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import styles from './Avatar.module.css';

type Status = 'loading' | 'loaded' | 'error';

export type AvatarImageProps = Omit<ComponentPropsWithRef<'img'>, 'src' | 'alt' | 'ref'> & { src: string };

/**
 * The only client part of Avatar: it removes itself when the image fails, revealing the
 * server-rendered initials underneath. Decorative (`alt=""`): the Avatar root carries the name.
 * Avatar renders it with `key={src}`, so a new `src` starts again from 'loading'.
 */
export function AvatarImage({ src, className, onLoad, onError, ...rest }: AvatarImageProps) {
  const [status, setStatus] = useState<Status>('loading');

  if (status === 'error') return null;

  return (
    <img
      {...rest}
      // The image can finish (or fail) before hydration attaches onLoad/onError: read its state on attach.
      ref={(node) => {
        if (node?.complete && status === 'loading') setStatus(node.naturalWidth > 0 ? 'loaded' : 'error');
      }}
      src={src}
      alt=""
      data-status={status}
      className={cx(styles.image, className)}
      onLoad={(event) => {
        setStatus('loaded');
        onLoad?.(event);
      }}
      onError={(event) => {
        setStatus('error');
        onError?.(event);
      }}
    />
  );
}
