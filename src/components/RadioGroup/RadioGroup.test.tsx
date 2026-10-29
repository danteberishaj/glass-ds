import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Radio, RadioGroup } from './RadioGroup';

function Plans(props: Partial<ComponentProps<typeof RadioGroup>>) {
  return (
    <RadioGroup label="Plan" {...props}>
      <Radio value="free" label="Free" />
      <Radio value="pro" label="Pro" />
      <Radio value="team" label="Team" />
    </RadioGroup>
  );
}

describe('RadioGroup', () => {
  afterEach(() => vi.restoreAllMocks());

  it('renders a named group of native radios sharing one name', () => {
    render(<Plans />);
    expect(screen.getByRole('group', { name: 'Plan' }).tagName).toBe('FIELDSET');
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(3);
    const name = radios[0]?.getAttribute('name');
    expect(name).toBeTruthy();
    radios.forEach((radio) => expect(radio).toHaveAttribute('name', name));
  });

  it('uses defaultValue and reports changes (uncontrolled)', async () => {
    const onValueChange = vi.fn();
    render(<Plans defaultValue="pro" onValueChange={onValueChange} />);
    expect(screen.getByLabelText('Pro')).toBeChecked();
    await userEvent.click(screen.getByText('Team'));
    expect(screen.getByLabelText('Team')).toBeChecked();
    expect(onValueChange).toHaveBeenCalledWith('team', expect.anything());
  });

  it('follows value when controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('free');
      return (
        <>
          <Plans value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByLabelText('Team'));
    expect(screen.getByLabelText('Team')).toBeChecked();
    expect(screen.getByLabelText('Free')).not.toBeChecked();
    expect(screen.getByRole('status')).toHaveTextContent('team');
  });

  it('stays controlled when value starts as undefined (no uncontrolled→controlled warning)', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    function Controlled() {
      const [value, setValue] = useState<string | undefined>(undefined);
      return <Plans value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked());
    await userEvent.click(screen.getByLabelText('Pro'));
    expect(screen.getByLabelText('Pro')).toBeChecked();
    expect(error).not.toHaveBeenCalled();
  });

  it('marks the legend required and hides it visually on request', () => {
    render(<Plans required hideLabel />);
    const group = screen.getByRole('group', { name: 'Plan' });
    expect(group.querySelector('legend')).toHaveClass('gds-sr-only');
    expect(screen.getByText('*')).toHaveAttribute('aria-hidden', 'true');
  });

  it('ignores clicks when controlled value does not change', async () => {
    render(<Plans value="free" />);
    await userEvent.click(screen.getByLabelText('Team'));
    expect(screen.getByLabelText('Free')).toBeChecked();
  });

  it('submits the selected value with a custom name', () => {
    render(
      <form data-testid="form">
        <Plans name="plan" defaultValue="team" />
      </form>,
    );
    expect(new FormData(screen.getByTestId('form') as HTMLFormElement).get('plan')).toBe('team');
  });

  it('disables every radio through the fieldset', () => {
    render(<Plans disabled />);
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
  });

  it('links hint and error to the group and sets required', () => {
    render(<Plans hint="Pick one" error="Required" required />);
    expect(screen.getByRole('group')).toHaveAccessibleDescription('Pick one Required');
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeRequired());
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <RadioGroup label="Plan" hint="Hint" error="Error" defaultValue="a">
        <Radio value="a" label="A" hint="Option hint" />
        <Radio value="b" aria-label="B" />
      </RadioGroup>,
    );
    await expectNoA11yViolations(container);
  });
});
