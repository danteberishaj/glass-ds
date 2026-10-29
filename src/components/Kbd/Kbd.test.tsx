import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Kbd } from './Kbd';

describe('Kbd', () => {
  it('renders a native kbd keycap', () => {
    const ref = createRef<HTMLElement>();
    render(<Kbd ref={ref} size="sm" className="custom">Esc</Kbd>);
    const key = screen.getByText('Esc');
    expect(key.tagName).toBe('KBD');
    expect(key).toHaveAttribute('data-size', 'sm');
    expect(key).toHaveClass('gds-glass', 'custom');
    expect(ref.current).toBe(key);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <p>
        Press <Kbd title="Command">⌘</Kbd> <Kbd>K</Kbd>
      </p>,
    );
    await expectNoA11yViolations(container);
  });
});
