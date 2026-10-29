import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Progress } from './Progress';

describe('Progress', () => {
  it('exposes value, min and max and is named by the label', () => {
    render(<Progress value={40} label="Upload" showValue />);
    const bar = screen.getByRole('progressbar', { name: 'Upload' });
    expect(bar).toHaveAttribute('aria-valuenow', '40');
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
    expect(bar).toHaveAttribute('data-state', 'determinate');
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(bar.style.getPropertyValue('--_progress')).toBe('0.4');
  });

  it('clamps out-of-range values and supports custom ranges', () => {
    const { rerender } = render(<Progress value={150} aria-label="A" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    rerender(<Progress value={3} min={1} max={5} aria-label="A" showValue valueText="3 of 5" />);
    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuetext', '3 of 5');
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('is indeterminate without a value: no aria-valuenow, no percentage', () => {
    render(<Progress label="Loading" showValue />);
    const bar = screen.getByRole('progressbar', { name: 'Loading' });
    expect(bar).not.toHaveAttribute('aria-valuenow');
    expect(bar).toHaveAttribute('data-state', 'indeterminate');
    expect(screen.queryByText(/%$/)).toBeNull();
  });

  it('prefers an explicit aria-label, forwards ref, merges className', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Progress ref={ref} value={10} label="Visible" aria-label="Override" className="custom" tone="danger" size="lg" />);
    expect(screen.getByRole('progressbar', { name: 'Override' })).toBe(ref.current);
    expect(ref.current).toHaveClass('custom', 'root');
    expect(ref.current).toHaveAttribute('data-tone', 'danger');
    expect(ref.current).toHaveAttribute('data-size', 'lg');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Progress value={40} label="Upload" showValue />
        <Progress aria-label="Loading" />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
