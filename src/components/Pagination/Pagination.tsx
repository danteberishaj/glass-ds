import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
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
   * Link mode only: the component to render each link with (e.g. `Link` from next/link). It receives
   * `href`, `aria-*`, `className`, `onClick` and the children. Defaults to `a`.
   */
  linkComponent?: ElementType;
  /**
   * Button mode: called with the requested page. Like `Button onClick`, the caller must then be a
   * Client Component.
   */
  onPageChange?: (page: number) => void;
  /** Adds "First page" / "Last page" controls at the ends. Default `false`. */
  showEdges?: boolean;
  /** Accessible names, for localisation. */
  previousLabel?: string;
  nextLabel?: string;
  firstLabel?: string;
  lastLabel?: string;
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
  linkComponent: LinkComponent = 'a',
  onPageChange,
  showEdges = false,
  previousLabel = 'Previous page',
  nextLabel = 'Next page',
  firstLabel = 'First page',
  lastLabel = 'Last page',
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
      className: styles.control,
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
        <LinkComponent href={getHref(target)} onClick={onPageChange ? () => onPageChange(target) : undefined} {...shared}>
          {children}
        </LinkComponent>
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

  const chevron = (direction: 'previous' | 'next', double = false) => (
    <span className={styles.chevrons} aria-hidden="true">
      <span className={styles.chevron} data-direction={direction} />
      {double && <span className={styles.chevron} data-direction={direction} />}
    </span>
  );

  return (
    <nav aria-label={ariaLabel} data-size={size} className={cx(styles.root, className)} {...rest}>
      {/* One glass layer: the list is the track; controls use translucent fills (like TabList). */}
      <ul className={cx(GLASS_CLASS, styles.list)}>
        {showEdges && (
          <li>{control(1, firstLabel, chevron('previous', true), { disabled: current <= 1, kind: 'first' })}</li>
        )}
        <li>{control(current - 1, previousLabel, chevron('previous'), { disabled: current <= 1, kind: 'previous' })}</li>
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
        <li>{control(current + 1, nextLabel, chevron('next'), { disabled: current >= total, kind: 'next' })}</li>
        {showEdges && (
          <li>{control(total, lastLabel, chevron('next', true), { disabled: current >= total, kind: 'last' })}</li>
        )}
      </ul>
    </nav>
  );
}
