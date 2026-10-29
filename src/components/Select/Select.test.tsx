import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Select } from './Select';

const options = (
  <>
    <option value="it">Italy</option>
    <option value="fr">France</option>
  </>
);

describe('Select', () => {
  it('is a native select associated with its label', async () => {
    const ref = createRef<HTMLSelectElement>();
    const onChange = vi.fn();
    render(
      <Select label="Country" ref={ref} onChange={onChange}>
        {options}
      </Select>,
    );
    const select = screen.getByRole('combobox', { name: 'Country' });
    expect(select).toBeInstanceOf(HTMLSelectElement);
    expect(ref.current).toBe(select);
    expect(select).toHaveValue('it');
    await userEvent.selectOptions(select, 'fr');
    expect(select).toHaveValue('fr');
    expect(onChange).toHaveBeenCalledOnce();
  });

  it('starts on a disabled placeholder option', () => {
    render(
      <Select label="Country" placeholder="Pick one">
        {options}
      </Select>,
    );
    const select = screen.getByLabelText('Country');
    expect(select).toHaveValue('');
    const placeholder = screen.getByRole('option', { name: 'Pick one' });
    expect(placeholder).toBeDisabled();
    expect((placeholder as HTMLOptionElement).selected).toBe(true);
  });

  it('keeps an explicit defaultValue when a placeholder is set', () => {
    render(
      <Select label="Country" placeholder="Pick one" defaultValue="fr">
        {options}
      </Select>,
    );
    expect(screen.getByLabelText('Country')).toHaveValue('fr');
  });

  it('fails native required validation on the placeholder', () => {
    render(
      <Select label="Country" placeholder="Pick one" required>
        {options}
      </Select>,
    );
    expect((screen.getByLabelText('Country') as HTMLSelectElement).checkValidity()).toBe(false);
  });

  it('links hint and error through aria-describedby and marks invalid', () => {
    render(
      <Select label="Country" hint="Shipping" error="Required" aria-describedby="external">
        {options}
      </Select>,
    );
    const select = screen.getByLabelText('Country');
    expect(select).toHaveAttribute('aria-invalid', 'true');
    expect(select).toHaveAccessibleDescription('Shipping Required');
    expect(select.getAttribute('aria-describedby')).toMatch(/^external /);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <Select label="Country" placeholder="Pick one" hint="Hint" error="Error">
        {options}
      </Select>,
    );
    await expectNoA11yViolations(container);
  });
});
