import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { TextField } from './TextField';

describe('TextField', () => {
  it('associates the label with the input', () => {
    render(<TextField label="Email" />);
    expect(screen.getByLabelText('Email')).toBeInstanceOf(HTMLInputElement);
  });

  it('links hint and error through aria-describedby and marks invalid', () => {
    render(<TextField label="Email" hint="Work email" error="Required" aria-describedby="external" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Work email Required');
    expect(input.getAttribute('aria-describedby')).toMatch(/^external /);
  });

  it('respects a caller-provided id', () => {
    render(<TextField label="Name" id="name" hint="Full name" />);
    expect(screen.getByLabelText('Name')).toHaveAttribute('aria-describedby', 'name-hint');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<TextField label="Email" hint="Hint" error="Error" />);
    await expectNoA11yViolations(container);
  });
});
