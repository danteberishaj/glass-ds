import { render } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('is hidden from assistive tech', () => {
    const { container } = render(<Skeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    expect(container.firstElementChild).toHaveAttribute('data-radius', 'md');
  });

  it('turns width/height into custom properties, numbers as px', () => {
    const { container } = render(<Skeleton width={48} height="2rem" radius="full" />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.getPropertyValue('--_width')).toBe('48px');
    expect(el.style.getPropertyValue('--_height')).toBe('2rem');
    expect(el).toHaveAttribute('data-radius', 'full');
  });

  it('merges style and className and forwards ref', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Skeleton ref={ref} width={10} className="custom" style={{ marginTop: 4 }} />);
    expect(ref.current).toHaveClass('custom', 'root');
    expect(ref.current?.style.marginTop).toBe('4px');
    expect(ref.current?.style.getPropertyValue('--_width')).toBe('10px');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div aria-busy="true">
        <Skeleton />
        <Skeleton radius="full" width={40} height={40} />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
