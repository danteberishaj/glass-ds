import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import { getPaginationRange } from './getPaginationRange';
import styles from './Pagination.module.css';

export type PaginationSize = 'sm' | 'md';

export type PaginationProps = Omit<ComponentPropsWithRef<'nav'>, 'children'> & {
  /** Current page, 1-based. */
  page: number;
  totalPages: number;
  /** Pages on each side of the current one. Default 1. */
  siblingCount?: number;
  /** Pages always shown at each end. Default 1. */
  boundaryCount?: number;
  size?: PaginationSize;
  /**
   * Link mode: return the URL for a page. Renders `<a>` elements and works from Server Components.
   * Takes precedence over button mode; `onPageChange` is still called on click if given.
   */
  getHref?: (page: number) => string;
  /**
   * Button mode: called with the requested page. Like `Button onClick`, the caller must then be a
   * Client Component.
   */
  onPageChange?: (page: number) => void;
  /** Accessible names, for localisation. */
  previousLabel?: string;
  nextLabel?: string;
  getPageLabel?: (page: number) => string;
};

/**
 * Hook-free, so it renders in Server Components (use `getHref`).
 * Pages are computed by the exported pure helper `getPaginationRange`.
 */
export function Pagination({
  page,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
  size = 'md',
  getHref,
  onPageChange,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  getPageLabel = (p) => `Page ${p}`,
  className,
  'aria-label': ariaLabel = 'Pagination',
  ...rest
}: PaginationProps) {
  const total = Math.max(0, Math.floor(totalPages));
  const current = Math.min(Math.max(1, Math.floor(page)), Math.max(1, total));
  const items = getPaginationRange({ page: current, totalPages: total, siblingCount, boundaryCount });

  function control(target: number, label: string, children: ReactNode, opts: { disabled?: boolean; current?: boolean; kind: string }) {
    const shared = {
      'aria-label': label,
      'aria-current': opts.current ? ('page' as const) : undefined,
      'data-kind': opts.kind,
      className: cx(!opts.current && GLASS_CLASS, styles.control),
    };

    if (getHref) {
      if (opts.disabled) {
        // A link without href isn't focusable or announced as a link; role + aria-disabled restore that meaning.
        return (
          <a role="link" aria-disabled="true" {...shared}>
            {children}
          </a>
        );
      }
      return (
        <a href={getHref(target)} onClick={onPageChange ? () => onPageChange(target) : undefined} {...shared}>
          {children}
        </a>
      );
    }

    return (
      <button
        type="button"
        disabled={opts.disabled}
        onClick={onPageChange && !opts.current ? () => onPageChange(target) : undefined}
        {...shared}
      >
        {children}
      </button>
    );
  }

  return (
    <nav aria-label={ariaLabel} data-size={size} className={cx(styles.root, className)} {...rest}>
      <ul className={styles.list}>
        <li>
          {control(current - 1, previousLabel, <span className={styles.chevron} data-direction="previous" />, {
            disabled: current <= 1,
            kind: 'previous',
          })}
        </li>
        {items.map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              {control(item, getPageLabel(item), item, { current: item === current, kind: 'page' })}
            </li>
          ) : (
            <li key={item} aria-hidden="true" className={styles.ellipsis}>
              …
            </li>
          ),
        )}
        <li>
          {control(current + 1, nextLabel, <span className={styles.chevron} data-direction="next" />, {
            disabled: current >= total,
            kind: 'next',
          })}
        </li>
      </ul>
    </nav>
  );
}
