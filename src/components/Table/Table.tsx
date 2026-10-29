import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Table.module.css';

/*
 * Server-safe: no hooks or context. Options live as data attributes on <table>; cells read them
 * through inherited custom properties, so a nested Table keeps its own settings.
 */

export type TableDensity = 'compact' | 'comfortable';
export type TableAlign = 'start' | 'center' | 'end';

export type TableProps = ComponentPropsWithRef<'table'> & {
  /** Alternate row fills in the body. */
  striped?: boolean;
  /** Highlight body rows on hover. */
  hoverable?: boolean;
  density?: TableDensity;
  /**
   * Keep the header visible while the body scrolls. The table scrolls inside its glass container,
   * so give the container a height, e.g. `containerProps={{ style: { maxHeight: 400 } }}`.
   */
  stickyHeader?: boolean;
  /** Props for the glass container (the horizontally scrolling wrapper around the <table>). */
  containerProps?: ComponentPropsWithRef<'div'>;
};

/** `ref`, `className` and the other props go to the <table>; the glass wrapper takes `containerProps`. */
export function Table({
  striped = false,
  hoverable = false,
  density = 'comfortable',
  stickyHeader = false,
  containerProps,
  className,
  ...rest
}: TableProps) {
  const { className: containerClassName, ...containerRest } = containerProps ?? {};
  return (
    <div
      className={cx(GLASS_CLASS, styles.container, containerClassName)}
      {...containerRest}
    >
      <table
        data-striped={striped || undefined}
        data-hoverable={hoverable || undefined}
        data-density={density}
        data-sticky-header={stickyHeader || undefined}
        className={cx(styles.table, className)}
        {...rest}
      />
    </div>
  );
}

export type TableCaptionProps = ComponentPropsWithRef<'caption'>;
export function TableCaption({ className, ...rest }: TableCaptionProps) {
  return <caption className={cx(styles.caption, className)} {...rest} />;
}

export type TableHeaderProps = ComponentPropsWithRef<'thead'>;
export function TableHeader({ className, ...rest }: TableHeaderProps) {
  return <thead className={cx(styles.header, className)} {...rest} />;
}

export type TableBodyProps = ComponentPropsWithRef<'tbody'>;
export function TableBody({ className, ...rest }: TableBodyProps) {
  return <tbody className={cx(styles.body, className)} {...rest} />;
}

export type TableFooterProps = ComponentPropsWithRef<'tfoot'>;
export function TableFooter({ className, ...rest }: TableFooterProps) {
  return <tfoot className={cx(styles.footer, className)} {...rest} />;
}

export type TableRowProps = ComponentPropsWithRef<'tr'>;
/**
 * Set `data-state="selected"` to highlight a selected row. The highlight is a surface colour only, so
 * the selection must also be in the content: a checkbox cell (`<Checkbox aria-label="Select row" checked>`)
 * or `aria-selected` on a grid row. Colour alone is not announced and vanishes in forced-colors mode.
 */
export function TableRow({ className, ...rest }: TableRowProps) {
  return <tr className={cx(styles.row, className)} {...rest} />;
}

export type TableHeadProps = Omit<ComponentPropsWithRef<'th'>, 'align'> & {
  /** Text alignment. Use `end` for numbers. */
  align?: TableAlign;
};
/** Column header: `scope="col"` by default. Pass `scope="row"` for a row header in the body. */
export function TableHead({ scope = 'col', align, className, ...rest }: TableHeadProps) {
  return <th scope={scope} data-align={align} className={cx(styles.head, className)} {...rest} />;
}

export type TableCellProps = Omit<ComponentPropsWithRef<'td'>, 'align'> & {
  /** Text alignment. Use `end` for numbers (also switches to tabular figures). */
  align?: TableAlign;
};
export function TableCell({ align, className, ...rest }: TableCellProps) {
  return <td data-align={align} className={cx(styles.cell, className)} {...rest} />;
}
