import type { ComponentPropsWithRef, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import styles from './AppShell.module.css';

/*
 * Server-safe page layout: optional header (a Navbar) and sidebar (a Sidebar) around a <main>.
 * Below `sidebarBreakpoint` the sidebar column hides; show the same links in a Drawer opened from
 * NavbarMenuButton. Breakpoints are viewport media queries.
 */

export type AppShellLayout = 'sidebar-first' | 'header-first';
export type AppShellSidebarSide = 'left' | 'right';
export type AppShellBreakpoint = 'sm' | 'md' | 'lg' | 'never';

export type AppShellProps = Omit<ComponentPropsWithRef<'div'>, 'children'> & {
  header?: ReactNode;
  sidebar?: ReactNode;
  /**
   * `sidebar-first`: the sidebar runs full height and the header sits beside it.
   * `header-first`: the header spans the full width and the sidebar sits below it.
   */
  layout?: AppShellLayout;
  /** Which side the sidebar column sits on. Pair it with `<Sidebar side="right">`. Defaults to `left`. */
  sidebarSide?: AppShellSidebarSide;
  /** Below this width the sidebar column hides. sm 640px, md 768px, lg 1024px. Defaults to `md`. */
  sidebarBreakpoint?: AppShellBreakpoint;
  /** Id for the <main> element; the skip link targets it. Defaults to `main-content`. */
  mainId?: string;
  /** Text of the skip link shown on keyboard focus. */
  skipLinkLabel?: string;
  /** Props for the <main> element. */
  mainProps?: ComponentPropsWithRef<'main'>;
  /** The page content. */
  children?: ReactNode;
};

export function AppShell({
  header,
  sidebar,
  layout = 'sidebar-first',
  sidebarSide = 'left',
  sidebarBreakpoint = 'md',
  mainId = 'main-content',
  skipLinkLabel = 'Skip to content',
  mainProps,
  className,
  children,
  ...rest
}: AppShellProps) {
  return (
    <div
      data-layout={layout}
      data-sidebar-side={sidebarSide}
      data-breakpoint={sidebarBreakpoint}
      data-has-header={header ? '' : undefined}
      data-has-sidebar={sidebar ? '' : undefined}
      className={cx(styles.root, className)}
      {...rest}
    >
      <a href={`#${mainId}`} className={styles.skipLink}>
        {skipLinkLabel}
      </a>
      <div className={styles.frame}>
        {/* DOM order follows the visual order, so sequential focus and screen readers agree with the layout. */}
        {layout === 'header-first' && header && <div className={styles.header}>{header}</div>}
        {sidebar && <div className={styles.sidebar}>{sidebar}</div>}
        {layout !== 'header-first' && header && <div className={styles.header}>{header}</div>}
        <main id={mainId} tabIndex={-1} {...mainProps} className={cx(styles.main, mainProps?.className)}>
          {children}
        </main>
      </div>
    </div>
  );
}
