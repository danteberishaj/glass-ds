import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Switch } from './Switch';

describe('Switch', () => {
  it('is a native checkbox exposed as a switch', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Switch label="Wi-Fi" ref={ref} />);
    const control = screen.getByRole('switch', { name: 'Wi-Fi' });
    expect(control).toHaveAttribute('type', 'checkbox');
    expect(ref.current).toBe(control);
  });

  it('toggles with click and Space', async () => {
    const onChange = vi.fn();
    render(<Switch label="Wi-Fi" onChange={onChange} />);
    const control = screen.getByRole('switch');
    await userEvent.click(screen.getByText('Wi-Fi'));
    expect(control).toBeChecked();
    await userEvent.keyboard(' ');
    expect(control).not.toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(2);
  });

  it('links the hint and respects disabled', async () => {
    render(<Switch label="Wi-Fi" hint="Saves battery" disabled />);
    const control = screen.getByRole('switch');
    expect(control).toHaveAccessibleDescription('Saves battery');
    await userEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Switch label="Wi-Fi" hint="Hint" defaultChecked />
        <Switch aria-label="Dark mode" size="sm" />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
