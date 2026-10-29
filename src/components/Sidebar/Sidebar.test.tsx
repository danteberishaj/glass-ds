import { render, screen } from '@testing-library/react';
import { createRef, type ComponentProps } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarItem,
  SidebarLink,
  SidebarNav,
  SidebarSeparator,
  SidebarToggle,
} from './Sidebar';

const Icon = () => <svg data-testid="icon" />;

function Example({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Sidebar id="sb" collapsed={collapsed}>
      <SidebarHeader>
        Prism
        <SidebarToggle collapsed={collapsed} aria-controls="sb" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav>
          <SidebarGroup label="Workspace">
            <SidebarItem>
              <SidebarLink href="/" icon={<Icon />} active badge={<span>12</span>}>
                Inbox
              </SidebarLink>
            </SidebarItem>
            <SidebarItem>
              <SidebarLink href="/projects" icon={<Icon />}>
                Projects
              </SidebarLink>
            </SidebarItem>
          </SidebarGroup>
        </SidebarNav>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter>
        <SidebarLink as="button" icon={<Icon />}>
          Help
        </SidebarLink>
      </SidebarFooter>
    </Sidebar>
  );
}

describe('Sidebar', () => {
  it('is a plain container whose landmark is the navigation inside', () => {
    render(<Example />);
    expect(screen.queryByRole('complementary')).toBeNull();
    expect(screen.getByRole('navigation', { name: 'Sidebar navigation' })).toBeInTheDocument();
    expect(document.getElementById('sb')?.tagName).toBe('DIV');
  });

  it('SidebarGroup root is the wrapper; listProps reach the <ul>', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <SidebarGroup ref={ref} id="grp" className="wrap" label="Tools" listProps={{ className: 'ul', 'data-x': '1' } as ComponentProps<'ul'>}>
        <SidebarItem>Item</SidebarItem>
      </SidebarGroup>,
    );
    expect(ref.current).toHaveAttribute('id', 'grp');
    expect(ref.current).toHaveClass('wrap');
    const list = screen.getByRole('list', { name: 'Tools' });
    expect(ref.current).toContainElement(list);
    expect(list).toHaveClass('ul');
    expect(list).toHaveAttribute('data-x', '1');
  });

  it('as="button" defaults type="button"; as={Component} type-checks its own props', () => {
    const RouterLink = ({ to, ...props }: { to: string } & ComponentProps<'a'>) => <a href={to} {...props} />;
    render(
      <>
        <SidebarLink as="button">Action</SidebarLink>
        <SidebarLink as="button" type="submit">
          Submit
        </SidebarLink>
        <SidebarLink as={RouterLink} to="/docs" active>
          Docs
        </SidebarLink>
      </>,
    );
    expect(screen.getByRole('button', { name: 'Action' })).toHaveAttribute('type', 'button');
    expect(screen.getByRole('button', { name: 'Submit' })).toHaveAttribute('type', 'submit');
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs');
  });

  it('names each group list by its label', () => {
    render(<Example />);
    expect(screen.getByRole('list', { name: 'Workspace' })).toBeInTheDocument();
  });

  it('marks the active link and hides icons from assistive tech', () => {
    render(<Example />);
    const inbox = screen.getByRole('link', { name: /Inbox/ });
    expect(inbox).toHaveAttribute('aria-current', 'page');
    expect(screen.getAllByTestId('icon')[0]?.parentElement).toHaveAttribute('aria-hidden', 'true');
  });

  it('keeps link names when collapsed (labels are visually hidden, not removed)', () => {
    render(<Example collapsed />);
    expect(document.getElementById('sb')).toHaveAttribute('data-collapsed');
    expect(screen.getByRole('link', { name: 'Projects' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
  });

  it('toggle reflects the state in its name and aria-expanded', () => {
    const { rerender } = render(<Example />);
    expect(screen.getByRole('button', { name: 'Collapse sidebar' })).toHaveAttribute('aria-expanded', 'true');
    rerender(<Example collapsed />);
    expect(screen.getByRole('button', { name: 'Expand sidebar' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('has no a11y violations, expanded or collapsed', async () => {
    const { container, rerender } = render(<Example />);
    await expectNoA11yViolations(container);
    rerender(<Example collapsed />);
    await expectNoA11yViolations(container);
  });
});
