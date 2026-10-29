import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Navbar, NavbarActions, NavbarBrand, NavbarItem, NavbarLink, NavbarMenuButton, NavbarNav } from './Navbar';

function Example({ open = false, onMenu }: { open?: boolean; onMenu?: () => void }) {
  return (
    <Navbar>
      <NavbarMenuButton open={open} onClick={onMenu} />
      <NavbarBrand href="/">Prism</NavbarBrand>
      <NavbarNav>
        <NavbarItem>
          <NavbarLink href="/" active>
            Overview
          </NavbarLink>
        </NavbarItem>
        <NavbarItem>
          <NavbarLink href="/team">Team</NavbarLink>
        </NavbarItem>
      </NavbarNav>
      <NavbarActions>
        <button type="button">Sign in</button>
      </NavbarActions>
    </Navbar>
  );
}

describe('Navbar', () => {
  it('renders a banner with a labelled navigation list', () => {
    render(<Example />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(within(nav).getAllByRole('listitem')).toHaveLength(2);
  });

  it('marks only the active link as the current page', () => {
    render(<Example />);
    expect(screen.getByRole('link', { name: 'Overview' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Team' })).not.toHaveAttribute('aria-current');
  });

  it('renders the brand as a link only when it has an href', () => {
    const { rerender } = render(<NavbarBrand href="/">Prism</NavbarBrand>);
    expect(screen.getByRole('link', { name: 'Prism' })).toBeInTheDocument();
    rerender(<NavbarBrand>Prism</NavbarBrand>);
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('supports framework links through `as`', () => {
    const RouterLink = ({ to, ...props }: { to: string } & React.ComponentProps<'a'>) => <a href={to} {...props} />;
    render(
      // Extra props of an `as` component aren't in the static type (same as BreadcrumbLink).
      <NavbarLink as={RouterLink} {...({ to: '/docs' } as object)}>
        Docs
      </NavbarLink>,
    );
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('menu button reflects open state in its name and aria-expanded', async () => {
    const onMenu = vi.fn();
    const { rerender } = render(<Example onMenu={onMenu} />);
    const button = screen.getByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(button);
    expect(onMenu).toHaveBeenCalledOnce();
    rerender(<Example open onMenu={onMenu} />);
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);
  });
});
