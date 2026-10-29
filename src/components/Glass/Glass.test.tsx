import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Glass } from './Glass';

describe('Glass', () => {
  it('renders a div with the glass recipe and data attributes', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Glass ref={ref} className="mine" intensity="strong" radius="sm" elevation="raised">Pane</Glass>);
    expect(ref.current?.tagName).toBe('DIV');
    expect(ref.current).toHaveClass('gds-glass', 'root', 'mine');
    expect(ref.current).toHaveAttribute('data-intensity', 'strong');
    expect(ref.current).toHaveAttribute('data-radius', 'sm');
    expect(ref.current).toHaveAttribute('data-elevation', 'raised');
  });

  it('renders as a section with its own ARIA props', () => {
    render(
      <Glass as="section" aria-label="Pricing">
        Content
      </Glass>,
    );
    expect(screen.getByRole('region', { name: 'Pricing' }).tagName).toBe('SECTION');
  });

  it('renders as a link with href (element props follow `as`)', () => {
    const ref = createRef<HTMLAnchorElement>();
    render(
      <Glass as="a" href="#x" ref={ref}>
        Go
      </Glass>,
    );
    expect(screen.getByRole('link', { name: 'Go' })).toHaveAttribute('href', '#x');
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <Glass as="section" aria-label="Pane">
        <p>Text</p>
      </Glass>,
    );
    await expectNoA11yViolations(container);
  });
});
