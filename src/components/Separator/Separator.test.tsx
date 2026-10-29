import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Separator } from './Separator';

describe('Separator', () => {
  it('is decorative by default', () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild!;
    expect(el).toHaveAttribute('role', 'none');
    expect(el).not.toHaveAttribute('aria-orientation');
    expect(el).toHaveAttribute('data-orientation', 'horizontal');
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('exposes role and orientation when semantic', () => {
    render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Separator ref={ref} className="custom" decorative={false} />);
    expect(ref.current).toHaveClass('custom', 'root');
    expect(ref.current).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <p>One</p>
        <Separator />
        <p>Two</p>
        <Separator decorative={false} />
        <p>Three</p>
        <Separator decorative={false} orientation="vertical" />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
