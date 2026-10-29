import { render, screen } from '@testing-library/react';
import type { ComponentPropsWithRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './Breadcrumb';

function Example() {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbLink href="/">Home</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbEllipsis />
      </BreadcrumbItem>
      <BreadcrumbSeparator>/</BreadcrumbSeparator>
      <BreadcrumbItem>
        <BreadcrumbLink href="/docs">Docs</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Tabs</BreadcrumbPage>
      </BreadcrumbItem>
    </Breadcrumb>
  );
}

describe('Breadcrumb', () => {
  it('renders a labelled nav with an ordered list', () => {
    render(<Example />);
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' });
    expect(nav.querySelector('ol')).not.toBeNull();
    expect(screen.getAllByRole('listitem')).toHaveLength(4);
  });

  it('marks the current page and hides separators', () => {
    render(<Example />);
    expect(screen.getByText('Tabs')).toHaveAttribute('aria-current', 'page');
    const separators = document.querySelectorAll('li[aria-hidden="true"]');
    expect(separators).toHaveLength(3);
    expect(separators[1]).toHaveTextContent('/');
    expect(separators[0]).toHaveAttribute('data-default');
  });

  it('renders links, and custom components through `as`', () => {
    function RouterLink({ href, ...rest }: ComponentPropsWithRef<'a'>) {
      return <a data-router="" href={href} {...rest} />;
    }
    render(
      <Breadcrumb aria-label="You are here">
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} href="/settings" className="extra">
            Settings
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>,
    );
    const link = screen.getByRole('link', { name: 'Settings' });
    expect(link).toHaveAttribute('data-router');
    expect(link).toHaveAttribute('href', '/settings');
    expect(link).toHaveClass('extra');
    expect(screen.getByRole('navigation', { name: 'You are here' })).toBeInTheDocument();
  });

  it('gives the ellipsis screen-reader text', () => {
    render(<Example />);
    expect(screen.getByText('More pages')).toHaveClass('gds-sr-only');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Example />);
    await expectNoA11yViolations(container);
  });
});
