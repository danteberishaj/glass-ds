import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('is a status with a visually hidden "Loading" label by default', () => {
    render(<Spinner />);
    const status = screen.getByRole('status');
    expect(status).toHaveTextContent('Loading');
    expect(screen.getByText('Loading')).toHaveClass('gds-sr-only');
    expect(status).toHaveAttribute('data-size', 'md');
  });

  it('accepts a custom label, size and tone, forwards ref and merges className', () => {
    const ref = createRef<HTMLSpanElement>();
    render(<Spinner ref={ref} label="Saving draft" size="lg" tone="current" className="custom" />);
    expect(screen.getByRole('status')).toHaveTextContent('Saving draft');
    expect(ref.current).toHaveAttribute('data-size', 'lg');
    expect(ref.current).toHaveAttribute('data-tone', 'current');
    expect(ref.current).toHaveClass('custom', 'root');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Spinner />);
    await expectNoA11yViolations(container);
  });
});
