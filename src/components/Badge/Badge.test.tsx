import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Badge } from './Badge';

describe('Badge', () => {
  it('renders data attributes for variant, tone and size', () => {
    render(<Badge tone="success" size="sm">Active</Badge>);
    const badge = screen.getByText('Active');
    expect(badge).toHaveAttribute('data-variant', 'glass');
    expect(badge).toHaveAttribute('data-tone', 'success');
    expect(badge).toHaveAttribute('data-size', 'sm');
  });

  it('applies the glass recipe only to the glass variant', () => {
    const { rerender } = render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toHaveClass('gds-glass');
    rerender(<Badge variant="solid">New</Badge>);
    expect(screen.getByText('New')).not.toHaveClass('gds-glass');
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Badge ref={ref} className="custom">X</Badge>);
    expect(ref.current).toBeInstanceOf(HTMLSpanElement);
    expect(ref.current).toHaveClass('custom', 'root');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Badge tone="danger" variant="outline">Failed</Badge>);
    await expectNoA11yViolations(container);
  });
});
