import type { ComponentPropsWithRef, ElementType } from 'react';

/*
 * Typing for components that take an `as` prop (BreadcrumbLink, NavbarLink, NavbarBrand, SidebarLink).
 * Not exported from the package.
 *
 * `PolymorphicProps<T, Own>` = the component's own props + `as?: T` + the props of `T` (ref included,
 * React 19 ref-as-prop), minus the ones `Own` overrides. A consumer writing `<NavbarLink as={Link} to="/x">`
 * gets `to` type-checked against `Link`'s props, and `href` is rejected when `Link` has no `href`.
 *
 * Usage:
 *   type LinkOwnProps = { active?: boolean };
 *   export type NavbarLinkProps<T extends ElementType = 'a'> = PolymorphicProps<T, LinkOwnProps>;
 *   export function NavbarLink<T extends ElementType = 'a'>({ as, ...rest }: NavbarLinkProps<T>) { … }
 *
 * The non-generic name (`NavbarLinkProps`) stays usable: with no type argument it is the `'a'` instantiation.
 */
export type PolymorphicProps<T extends ElementType, Own = object> = Own & {
  /** Element or component to render. */
  as?: T;
} & Omit<ComponentPropsWithRef<T>, keyof Own | 'as'>;
