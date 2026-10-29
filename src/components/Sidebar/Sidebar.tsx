import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import type { PolymorphicProps } from '../../internal/polymorphic';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import type { GlassIntensity } from '../Glass';
import styles from './Sidebar.module.css';

/*
 * Server-safe: no hooks or context. Collapsing is a prop (`collapsed`), so the caller owns the state;
 * every part reads it from the root's data attribute in CSS. Compound parts are flat named exports.
 * Structure: <div> header · content(<nav><ul>groups…</ul></nav>) · footer </div>
 * The root is a plain <div>: the landmark is the <nav> inside (SidebarNav), named "Sidebar navigation"
 * by default. Wrap it in your own <aside> if the sidebar also carries non-navigation content.
 */

export type SidebarProps = ComponentPropsWithRef<'div'> & {
  /** Icon-only rail. Labels stay in the DOM for screen readers. */
  collapsed?: boolean;
  /** Which edge it sits on; flips the edge border and the toggle chevron. */
  side?: 'left' | 'right';
  /**
   * `floating`: a rounded glass panel with a gutter. `attached`: flush with the viewport edge.
   */
  variant?: 'floating' | 'attached';
  intensity?: GlassIntensity;
  /**
   * `none` drops the glass surface, for a sidebar placed inside another glass panel (e.g. a Drawer
   * on mobile). Nested glass only blurs its parent and renders as a flat milky box.
   */
  surface?: 'glass' | 'none';
};

export function Sidebar({
  collapsed = false,
  side = 'left',
  variant = 'floating',
  intensity = 'regular',
  surface = 'glass',
  className,
  ...rest
}: SidebarProps) {
  return (
    <div
      data-collapsed={collapsed ? '' : undefined}
      data-side={side}
      data-variant={variant}
      data-intensity={intensity}
      data-surface={surface}
      className={cx(surface === 'glass' && GLASS_CLASS, styles.root, className)}
      {...rest}
    />
  );
}

export type SidebarHeaderProps = ComponentPropsWithRef<'div'>;
export function SidebarHeader({ className, ...rest }: SidebarHeaderProps) {
  return <div className={cx(styles.header, className)} {...rest} />;
}

export type SidebarContentProps = ComponentPropsWithRef<'div'>;
/** The scrollable middle. */
export function SidebarContent({ className, ...rest }: SidebarContentProps) {
  return <div className={cx(styles.content, className)} {...rest} />;
}

export type SidebarFooterProps = ComponentPropsWithRef<'div'>;
export function SidebarFooter({ className, ...rest }: SidebarFooterProps) {
  return <div className={cx(styles.footer, className)} {...rest} />;
}

export type SidebarNavProps = ComponentPropsWithRef<'nav'>;
/** Navigation landmark (named "Sidebar navigation" by default). Put one or more `SidebarGroup`s inside. */
export function SidebarNav({ className, 'aria-label': ariaLabel = 'Sidebar navigation', ...rest }: SidebarNavProps) {
  return <nav aria-label={ariaLabel} className={cx(styles.nav, className)} {...rest} />;
}

export type SidebarGroupProps = ComponentPropsWithRef<'div'> & {
  /** Visible section heading; also the list's accessible name. Hidden (but still announced) when collapsed. */
  label?: string;
  /** Props for the inner `<ul>` (the root props go on the wrapping `<div>`). */
  listProps?: ComponentPropsWithRef<'ul'>;
};

/** A labelled list of `SidebarItem`s. The root is the wrapper div; `listProps` reaches the `<ul>`. */
export function SidebarGroup({ label, listProps, className, children, ...rest }: SidebarGroupProps) {
  return (
    <div className={cx(styles.group, className)} {...rest}>
      {label && (
        <div className={styles.groupLabel} aria-hidden="true">
          {label}
        </div>
      )}
      <ul aria-label={label} {...listProps} className={cx(styles.list, listProps?.className)}>
        {children}
      </ul>
    </div>
  );
}

export type SidebarItemProps = ComponentPropsWithRef<'li'>;
export function SidebarItem({ className, ...rest }: SidebarItemProps) {
  return <li className={cx(styles.item, className)} {...rest} />;
}

type SidebarLinkOwnProps = {
  /** Marks the current page (`aria-current="page"`). */
  active?: boolean;
  /** Decorative icon (hidden from assistive tech). Required for a useful collapsed rail. */
  icon?: ReactNode;
  /** Trailing content: a count `Badge`, a shortcut `Kbd`… Hidden when collapsed. */
  badge?: ReactNode;
  /** The link text. */
  children: ReactNode;
};

/**
 * Generic over the rendered element: `<SidebarLink as={Link} to="/x">` type-checks `Link`'s own props,
 * and `as="button"` exposes button props (`type` defaults to `button`). Without a type argument it is the
 * plain `<a>` props.
 */
export type SidebarLinkProps<T extends ElementType = 'a'> = PolymorphicProps<
  T,
  SidebarLinkOwnProps & {
    /** Element or component to render, e.g. `Link` from next/link, or `button` for actions. Defaults to `a`. */
    as?: T;
  }
>;

export function SidebarLink<T extends ElementType = 'a'>({
  as,
  active = false,
  icon,
  badge,
  className,
  children,
  ...rest
}: SidebarLinkProps<T>) {
  const Component: ElementType = as ?? 'a';
  return (
    <Component
      type={Component === 'button' ? 'button' : undefined}
      aria-current={active ? 'page' : undefined}
      data-active={active ? '' : undefined}
      className={cx(styles.link, className)}
      {...rest}
    >
      {icon && (
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
      )}
      <span className={styles.label}>{children}</span>
      {badge && <span className={styles.badge}>{badge}</span>}
    </Component>
  );
}

export type SidebarSeparatorProps = ComponentPropsWithRef<'hr'>;
export function SidebarSeparator({ className, ...rest }: SidebarSeparatorProps) {
  return <hr className={cx(styles.separator, className)} {...rest} />;
}

export type SidebarToggleProps = ComponentPropsWithRef<'button'> & {
  /** Current state of the sidebar it controls. Sets `aria-expanded` and the chevron direction. */
  collapsed?: boolean;
  /** Accessible name. Defaults to "Collapse sidebar" / "Expand sidebar". */
  label?: string;
};

/** Wire `onClick` to flip `collapsed` (the caller is a Client Component). Pass `aria-controls` with the sidebar's id. */
export function SidebarToggle({ collapsed = false, label, type = 'button', className, ...rest }: SidebarToggleProps) {
  return (
    <button
      type={type}
      aria-expanded={!collapsed}
      data-collapsed={collapsed ? '' : undefined}
      className={cx(styles.toggle, className)}
      {...rest}
    >
      <span className={styles.chevron} aria-hidden="true" />
      <span className={SR_ONLY_CLASS}>{label ?? (collapsed ? 'Expand sidebar' : 'Collapse sidebar')}</span>
    </button>
  );
}
