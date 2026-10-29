import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import styles from './Dialog.module.css';
import { DialogRoot, type DialogRootProps } from './DialogRoot';

/*
 * Server-safe shell: the behaviour (and the parts that need context) live in DialogRoot.tsx,
 * the only 'use client' file. Layout parts below are plain elements.
 */

export { DialogTitle, DialogDescription, DialogClose } from './DialogRoot';
export type {
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
  DialogOpenChangeReason,
  DialogOpenChangeDetails,
} from './DialogRoot';

export type DialogSize = 'sm' | 'md' | 'lg';

export type DialogProps = DialogRootProps & {
  /** Panel width. */
  size?: DialogSize;
};

/** A modal glass panel on a native `<dialog>`. Name it with DialogTitle. */
export function Dialog({ size = 'md', className, ...rest }: DialogProps) {
  return <DialogRoot data-intensity="strong" data-size={size} className={cx(styles.dialog, className)} {...rest} />;
}

export type DialogHeaderProps = ComponentPropsWithRef<'div'>;
export function DialogHeader({ className, ...rest }: DialogHeaderProps) {
  return <div className={cx(styles.header, className)} {...rest} />;
}

export type DialogBodyProps = ComponentPropsWithRef<'div'>;
/** Scrolls when the content is taller than the viewport; header and footer stay put. */
export function DialogBody({ className, ...rest }: DialogBodyProps) {
  return <div className={cx(styles.body, className)} {...rest} />;
}

export type DialogFooterProps = ComponentPropsWithRef<'div'>;
export function DialogFooter({ className, ...rest }: DialogFooterProps) {
  return <div className={cx(styles.footer, className)} {...rest} />;
}
