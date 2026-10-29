import type { ComponentPropsWithRef, ElementType } from 'react';
import type { PolymorphicProps } from '../../internal/polymorphic';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import { SR_ONLY_CLASS } from '../../utils/sr-only';
import type { GlassIntensity } from '../Glass';
import styles from './Navbar.module.css';

/*
 * Server-safe: no hooks or context. Compound parts are flat named exports.
 * Structure: <header> brand · <nav><ul><li><a/></li></ul></nav> · actions </header>
 * Responsive via a container query on the bar itself, so it adapts to where it sits, not the viewport.
 */

export type NavbarVariant = 'floating' | 'attached';
export type NavbarCollapse = 'sm' | 'md' | 'lg' | 'never';

export type NavbarProps = ComponentPropsWithRef<'header'> & {
  /** `floating`: a detached pill with a gutter. `attached`: full-bleed with a bottom edge. */
  variant?: NavbarVariant;
  /** Sticks to the top of the scroll container. */
  sticky?: boolean;
  intensity?: GlassIntensity;
  /**
   * Below this container width, `NavbarNav` hides and `NavbarMenuButton` shows.
   * sm 640px, md 768px, lg 1024px. Defaults to `md`.
   */
  collapseBelow?: NavbarCollapse;
};

export function Navbar({
  variant = 'floating',
  sticky = false,
  intensity = 'regular',
  collapseBelow = 'md',
  className,
  children,
  ...rest
}: NavbarProps) {
  return (
    <header
      data-variant={variant}
      data-sticky={sticky ? '' : undefined}
      className={cx(styles.root, className)}
      {...rest}
    >
      <div data-intensity={intensity} data-collapse={collapseBelow} className={cx(GLASS_CLASS, styles.bar)}>
        {children}
      </div>
    </header>
  );
}

export type NavbarBrandProps<T extends ElementType = 'a'> = PolymorphicProps<
  T,
  {
    /** Element or component to render, e.g. `Link` from next/link. Defaults to `a` (or `div` without `href`). */
    as?: T;
  }
>;

/** Logo + product name. Usually links home. */
export function NavbarBrand<T extends ElementType = 'a'>({ as, className, ...rest }: NavbarBrandProps<T>) {
  const Component: ElementType = as ?? ('href' in rest && rest.href ? 'a' : 'div');
  return <Component className={cx(styles.brand, className)} {...rest} />;
}

export type NavbarNavProps = ComponentPropsWithRef<'nav'>;

/** The primary links. Wraps children in a list; pass `NavbarItem`s. Landmark name defaults to "Primary". */
export function NavbarNav({ className, children, 'aria-label': ariaLabel = 'Primary', ...rest }: NavbarNavProps) {
  return (
    <nav aria-label={ariaLabel} className={cx(styles.nav, className)} {...rest}>
      <ul className={styles.list}>{children}</ul>
    </nav>
  );
}

export type NavbarItemProps = ComponentPropsWithRef<'li'>;

export function NavbarItem({ className, ...rest }: NavbarItemProps) {
  return <li className={cx(styles.item, className)} {...rest} />;
}

type NavbarLinkOwnProps = {
  /** Marks the link as the current page (`aria-current="page"`). */
  active?: boolean;
};

/**
 * Generic over the rendered element: `<NavbarLink as={Link} to="/x">` type-checks `Link`'s own props.
 * Without a type argument it is the plain `<a>` props.
 */
export type NavbarLinkProps<T extends ElementType = 'a'> = PolymorphicProps<
  T,
  NavbarLinkOwnProps & {
    /** Element or component to render, e.g. `Link` from next/link. Defaults to `a`. */
    as?: T;
  }
>;

export function NavbarLink<T extends ElementType = 'a'>({ as, active = false, className, ...rest }: NavbarLinkProps<T>) {
  const Component: ElementType = as ?? 'a';
  return (
    <Component
      aria-current={active ? 'page' : undefined}
      data-active={active ? '' : undefined}
      className={cx(styles.link, className)}
      {...rest}
    />
  );
}

export type NavbarActionsProps = ComponentPropsWithRef<'div'>;

/** Right-hand cluster (search, theme toggle, avatar, CTA). Always visible. */
export function NavbarActions({ className, ...rest }: NavbarActionsProps) {
  return <div className={cx(styles.actions, className)} {...rest} />;
}

export type NavbarMenuButtonProps = ComponentPropsWithRef<'button'> & {
  /** Whether the menu it controls is open. Sets `aria-expanded` and morphs the icon into a close mark. */
  open?: boolean;
  /** Accessible name. Defaults to "Open menu" / "Close menu". */
  label?: string;
};

/**
 * Shown only below `collapseBelow`. Wire `onClick` to open a `Drawer` with the same links
 * (the caller is a Client Component, same rule as Button).
 */
export function NavbarMenuButton({ open = false, label, type = 'button', className, ...rest }: NavbarMenuButtonProps) {
  return (
    <button
      type={type}
      aria-expanded={open}
      data-open={open ? '' : undefined}
      className={cx(styles.menuButton, className)}
      {...rest}
    >
      <span className={styles.burger} aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      <span className={SR_ONLY_CLASS}>{label ?? (open ? 'Close menu' : 'Open menu')}</span>
    </button>
  );
}
