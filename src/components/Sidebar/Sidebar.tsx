import type { ComponentPropsWithRef, ElementType, ReactNode } from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import type { GlassIntensity } from '../Glass';
import styles from './Sidebar.module.css';

/*
 * Server-safe: no hooks or context. Collapsing is a prop (`collapsed`), so the caller owns the state;
 * every part reads it from the root's data attribute in CSS. Compound parts are flat named exports.
 * Structure: <aside> header · content(<nav><ul>groups…</ul></nav>) · footer </aside>
 */

export type SidebarProps = ComponentPropsWithRef<'aside'> & {
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
  'aria-label': ariaLabel = 'Sidebar',
  ...rest
}: SidebarProps) {
  return (
    <aside
      aria-label={ariaLabel}
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
/** Navigation landmark. Put one or more `SidebarGroup`s inside. */
export function SidebarNav({ className, 'aria-label': ariaLabel = 'Main', ...rest }: SidebarNavProps) {
  return <nav aria-label={ariaLabel} className={cx(styles.nav, className)} {...rest} />;
}

export type SidebarGroupProps = Omit<ComponentPropsWithRef<'ul'>, 'title'> & {
  /** Visible section heading; also the list's accessible name. Hidden (but still announced) when collapsed. */
  label?: string;
};

/** A labelled list of `SidebarItem`s. */
export function SidebarGroup({ label, className, children, ...rest }: SidebarGroupProps) {
  return (
    <div className={cx(styles.group, className)}>
      {label && (
        <div className={styles.groupLabel} aria-hidden="true">
          {label}
        </div>
      )}
      <ul aria-label={label} className={styles.list} {...rest}>
        {children}
      </ul>
    </div>
  );
}

export type SidebarItemProps = ComponentPropsWithRef<'li'>;
export function SidebarItem({ className, ...rest }: SidebarItemProps) {
  return <li className={cx(styles.item, className)} {...rest} />;
}

export type SidebarLinkProps = Omit<ComponentPropsWithRef<'a'>, 'children'> & {
  /** Element or component to render, e.g. `Link` from next/link, or `button` for actions. Defaults to `a`. */
  as?: ElementType;
  /** Marks the current page (`aria-current="page"`). */
  active?: boolean;
  /** Decorative icon (hidden from assistive tech). Required for a useful collapsed rail. */
  icon?: ReactNode;
  /** Trailing content: a count `Badge`, a shortcut `Kbd`… Hidden when collapsed. */
  badge?: ReactNode;
  /** The link text. */
  children: ReactNode;
};

export function SidebarLink({
  as: Component = 'a',
  active = false,
  icon,
  badge,
  className,
  children,
  ...rest
}: SidebarLinkProps) {
  return (
    <Component
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
