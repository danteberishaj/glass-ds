import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
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

  it('starts on with defaultChecked (uncontrolled)', async () => {
    render(<Switch label="Wi-Fi" defaultChecked />);
    const control = screen.getByRole('switch');
    expect(control).toBeChecked();
    await userEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it('follows checked when controlled', async () => {
    function Controlled() {
      const [on, setOn] = useState(false);
      return (
        <>
          <Switch label="Wi-Fi" checked={on} onChange={(e) => setOn(e.target.checked)} />
          <output>{on ? 'on' : 'off'}</output>
        </>
      );
    }
    render(<Controlled />);
    const control = screen.getByRole('switch');
    expect(control).not.toBeChecked();
    await userEvent.click(control);
    expect(control).toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('on');
  });

  it('ignores clicks when the controlled value does not change', async () => {
    render(<Switch label="Wi-Fi" checked={false} onChange={() => {}} />);
    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch')).not.toBeChecked();
  });

  it('puts className and style on the wrapper', () => {
    render(<Switch label="Wi-Fi" className="mine" style={{ margin: 4 }} />);
    const wrapper = screen.getByRole('switch').closest('.root')!;
    expect(wrapper).toHaveClass('mine');
    expect(wrapper).toHaveStyle({ margin: '4px' });
    expect(screen.getByRole('switch')).not.toHaveAttribute('style');
  });

  it('links the hint and respects disabled', async () => {
    render(<Switch label="Wi-Fi" hint="Saves battery" disabled />);
    const control = screen.getByRole('switch');
    expect(control).toHaveAccessibleDescription('Saves battery');
    await userEvent.click(control);
    expect(control).not.toBeChecked();
  });

  it('links the error, marks invalid and required', () => {
    render(<Switch label="Terms" error="Turn this on to continue" required />);
    const control = screen.getByRole('switch', { name: 'Terms' });
    expect(control).toHaveAttribute('aria-invalid', 'true');
    expect(control).toBeRequired();
    expect(control).toHaveAccessibleDescription('Turn this on to continue');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Switch label="Wi-Fi" hint="Hint" defaultChecked />
        <Switch aria-label="Dark mode" size="sm" />
        <Switch label="Terms" error="Required" required />
        <Switch label="Hidden" hideLabel />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
