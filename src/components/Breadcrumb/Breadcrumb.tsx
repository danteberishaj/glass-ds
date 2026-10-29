import type { ComponentPropsWithRef, ElementType } from 'react';
import { cx } from '../../utils/cx';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import styles from './Breadcrumb.module.css';

/*
 * Server-safe: no hooks or context. Compound parts are flat named exports.
 * Structure: <nav aria-label="Breadcrumb"><ol> <li>link</li> <li aria-hidden>/</li> … </ol></nav>
 */

export type BreadcrumbProps = ComponentPropsWithRef<'nav'>;

export function Breadcrumb({ className, children, 'aria-label': ariaLabel = 'Breadcrumb', ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} className={cx(styles.root, className)} {...rest}>
      <ol className={styles.list}>{children}</ol>
    </nav>
  );
}

export type BreadcrumbItemProps = ComponentPropsWithRef<'li'>;

export function BreadcrumbItem({ className, ...rest }: BreadcrumbItemProps) {
  return <li className={cx(styles.item, className)} {...rest} />;
}

export type BreadcrumbLinkProps = ComponentPropsWithRef<'a'> & {
  /** Element or component to render, e.g. `Link` from next/link. Defaults to `a`. */
  as?: ElementType;
};

export function BreadcrumbLink({ as: Component = 'a', className, ...rest }: BreadcrumbLinkProps) {
  return <Component className={cx(styles.link, className)} {...rest} />;
}

export type BreadcrumbPageProps = ComponentPropsWithRef<'span'>;

/** The current page. Not a link. */
export function BreadcrumbPage({ className, ...rest }: BreadcrumbPageProps) {
  return <span aria-current="page" className={cx(styles.page, className)} {...rest} />;
}

export type BreadcrumbSeparatorProps = ComponentPropsWithRef<'li'>;

/** Decorative, hidden from assistive tech. Without children it draws a chevron in CSS. */
export function BreadcrumbSeparator({ className, children, ...rest }: BreadcrumbSeparatorProps) {
  const custom = children !== undefined && children !== null;
  return (
    <li
      aria-hidden="true"
      data-default={custom ? undefined : ''}
      className={cx(styles.separator, className)}
      {...rest}
    >
      {custom ? children : <span className={styles.chevron} />}
    </li>
  );
}

export type BreadcrumbEllipsisProps = ComponentPropsWithRef<'span'> & {
  /** Screen-reader text. */
  label?: string;
};

/** Collapsed middle items. Put it in a BreadcrumbItem (or wrap it in a menu trigger). */
export function BreadcrumbEllipsis({ className, label = 'More pages', ...rest }: BreadcrumbEllipsisProps) {
  return (
    <span className={cx(styles.ellipsis, className)} {...rest}>
      <span aria-hidden="true">…</span>
      <span className={SR_ONLY_CLASS}>{label}</span>
    </span>
  );
}
