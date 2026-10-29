import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Separator } from './Separator';

describe('Separator', () => {
  it('is a decorative <hr> by default', () => {
    const { container } = render(<Separator />);
    const el = container.firstElementChild!;
    expect(el.tagName).toBe('HR');
    expect(el).toHaveAttribute('role', 'none');
    expect(el).not.toHaveAttribute('aria-orientation');
    expect(el).toHaveAttribute('data-orientation', 'horizontal');
    expect(screen.queryByRole('separator')).toBeNull();
  });

  it('uses the native separator role when semantic, with aria-orientation only when vertical', () => {
    const { rerender } = render(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
    rerender(<Separator decorative={false} />);
    expect(screen.getByRole('separator')).not.toHaveAttribute('role');
    expect(screen.getByRole('separator')).not.toHaveAttribute('aria-orientation');
  });

  it('merges className and forwards ref', () => {
    const ref = createRef<HTMLHRElement>();
    render(<Separator ref={ref} className="custom" decorative={false} />);
    expect(ref.current).toBeInstanceOf(HTMLHRElement);
    expect(ref.current).toHaveClass('custom', 'root');
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
