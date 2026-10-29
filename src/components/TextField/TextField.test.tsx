import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { TextField } from './TextField';

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement);
  });

  it('calls onChange and forwards ref to the input', async () => {
    const onChange = vi.fn();
    const ref = createRef<HTMLInputElement>();
    render(<TextField label="Email" ref={ref} onChange={onChange} />);
    const input = screen.getByLabelText('Email');
    expect(ref.current).toBe(input);
    await userEvent.type(input, 'ab');
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(input).toHaveValue('ab');
  });

  it('follows value when controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('a');
      return <TextField label="Name" value={value} onChange={(e) => setValue(e.target.value.toUpperCase())} />;
    }
    render(<Controlled />);
    const input = screen.getByLabelText('Name');
    expect(input).toHaveValue('a');
    await userEvent.type(input, 'b');
    expect(input).toHaveValue('AB');
  });

  it('puts className and style on the wrapper, everything else on the input', () => {
    render(<TextField label="Email" className="mine" style={{ width: 200 }} data-testid="field" name="email" />);
    const input = screen.getByTestId('field');
    expect(input.tagName).toBe('INPUT');
    expect(input).toHaveAttribute('name', 'email');
    expect(input).not.toHaveClass('mine');
    const wrapper = input.parentElement!;
    expect(wrapper).toHaveClass('mine', 'root');
    expect(wrapper).toHaveStyle({ width: '200px' });
    expect(input).not.toHaveAttribute('style');
  });

  it('links hint and error through aria-describedby and marks invalid', () => {
    render(<TextField label="Email" hint="Work email" error="Required" aria-describedby="external" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Work email Required');
    expect(input.getAttribute('aria-describedby')).toMatch(/^external /);
    expect(screen.getByText('Required')).toHaveAttribute('aria-live', 'polite');
  });

  it('respects a caller-provided id', () => {
    render(<TextField label="Name" id="name" hint="Full name" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-describedby', 'name-hint');
  });

  it('marks required fields natively and with a hidden asterisk', () => {
    render(<TextField label="Email" required />);
    const input = screen.getByRole('textbox', { name: 'Email' });
    expect(input).toBeRequired();
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('can hide the label visually while keeping the name', () => {
    render(<TextField label="Search" hideLabel />);
    const input = screen.getByRole<HTMLInputElement>('textbox', { name: 'Search' });
    expect(input.labels?.[0]).toHaveClass('gds-sr-only');
  });

  it('exposes size on the input', () => {
    render(<TextField label="Email" size="lg" />);
    expect(screen.getByLabelText('Email')).toHaveAttribute('data-size', 'lg');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <TextField label="Email" hint="Hint" error="Error" required />
        <TextField label="Hidden" hideLabel size="sm" />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
