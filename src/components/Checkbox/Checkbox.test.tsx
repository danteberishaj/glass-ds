import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  it('renders a native checkbox associated with its label', async () => {
    const onChange = vi.fn();
    render(<Checkbox label="Accept" onChange={onChange} />);
    const box = screen.getByRole('checkbox', { name: 'Accept' });
    expect(box).toBeInstanceOf(HTMLInputElement);
    await userEvent.click(screen.getByText('Accept'));
    expect(box).toBeChecked();
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('sets the indeterminate DOM property and forwards ref', () => {
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<Checkbox label="All" indeterminate ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
    expect(ref.current?.indeterminate).toBe(true);
    expect(screen.getByRole('checkbox')).toBePartiallyChecked();
    rerender(<Checkbox label="All" indeterminate={false} ref={ref} />);
    expect(ref.current?.indeterminate).toBe(false);
  });

  it('keeps indeterminate after a click on a controlled, unchecked box', async () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    const { rerender } = render(<Checkbox label="All" checked={false} indeterminate onChange={onChange} ref={ref} />);
    expect(ref.current?.indeterminate).toBe(true);
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onChange).toHaveBeenCalledOnce();
    // The parent keeps the same props (e.g. it ignored the change): the dash must not disappear.
    rerender(<Checkbox label="All" checked={false} indeterminate onChange={onChange} ref={ref} />);
    expect(ref.current?.indeterminate).toBe(true);
    expect(ref.current).not.toBeChecked();
  });

  it('puts className and style on the wrapper, ref and the rest on the input', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Checkbox label="Accept" ref={ref} className="mine" style={{ margin: 4 }} name="terms" />);
    expect(ref.current).toHaveAttribute('name', 'terms');
    expect(ref.current).not.toHaveAttribute('style');
    const wrapper = ref.current!.closest('.root')!;
    expect(wrapper).toHaveClass('mine');
    expect(wrapper).toHaveStyle({ margin: '4px' });
  });

  it('marks required with a hidden asterisk and keeps the native attribute', () => {
    render(<Checkbox label="Accept" required />);
    expect(screen.getByRole('checkbox', { name: 'Accept' })).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('supports callback refs', () => {
    const ref = vi.fn();
    render(<Checkbox label="All" ref={ref} />);
    expect(ref).toHaveBeenCalledWith(expect.any(HTMLInputElement));
  });

  it('links hint and error through aria-describedby and marks invalid', () => {
    render(<Checkbox label="Accept" hint="Read them" error="Required" aria-describedby="external" />);
    const box = screen.getByRole('checkbox');
    expect(box).toHaveAttribute('aria-invalid', 'true');
    expect(box).toHaveAccessibleDescription('Read them Required');
    expect(box.getAttribute('aria-describedby')).toMatch(/^external /);
  });

  it('accepts aria-label instead of a visible label', () => {
    render(<Checkbox aria-label="Select row" />);
    expect(screen.getByRole('checkbox', { name: 'Select row' })).toBeInTheDocument();
  });

  it('does not toggle when disabled', async () => {
    render(<Checkbox label="Accept" disabled />);
    await userEvent.click(screen.getByText('Accept'));
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('submits with the form', () => {
    render(
      <form data-testid="form">
        <Checkbox label="Accept" name="terms" value="yes" defaultChecked />
      </form>,
    );
    const form = screen.getByTestId('form') as HTMLFormElement;
    expect(new FormData(form).get('terms')).toBe('yes');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Checkbox label="Accept" hint="Hint" error="Error" />
        <Checkbox label="All" indeterminate />
        <Checkbox aria-label="Row" />
        <Checkbox label="Hidden" hideLabel required />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
