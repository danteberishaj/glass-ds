import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { AppShell } from './AppShell';

describe('AppShell', () => {
  it('renders header, sidebar and main content', () => {
    render(
      <AppShell header={<header>Top</header>} sidebar={<aside aria-label="Sidebar">Side</aside>}>
        <h1>Page</h1>
      </AppShell>,
    );
    expect(screen.getByRole('banner')).toHaveTextContent('Top');
    expect(screen.getByRole('complementary', { name: 'Sidebar' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toContainElement(screen.getByRole('heading', { name: 'Page' }));
  });

  it('skip link targets the focusable main element', () => {
    render(
      <AppShell mainId="content" skipLinkLabel="Skip">
        Page
      </AppShell>,
    );
    expect(screen.getByRole('link', { name: 'Skip' })).toHaveAttribute('href', '#content');
    const main = screen.getByRole('main');
    expect(main).toHaveAttribute('id', 'content');
    expect(main).toHaveAttribute('tabindex', '-1');
  });

  it('exposes layout and slot presence for styling', () => {
    const { container } = render(<AppShell layout="header-first">Page</AppShell>);
    const root = container.firstElementChild;
    expect(root).toHaveAttribute('data-layout', 'header-first');
    expect(root).not.toHaveAttribute('data-has-sidebar');
  });

  it('merges mainProps', () => {
    render(<AppShell mainProps={{ className: 'custom', 'aria-label': 'Dashboard' }}>Page</AppShell>);
    expect(screen.getByRole('main', { name: 'Dashboard' })).toHaveClass('custom');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <AppShell header={<header>Top</header>} sidebar={<aside aria-label="Sidebar">Side</aside>}>
        <h1>Page</h1>
      </AppShell>,
    );
    await expectNoA11yViolations(container);
  });
});
