import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Select } from './Select';

const countries = (
  <>
    <option value="it">Italy</option>
    <option value="fr">France</option>
    <option value="de">Germany</option>
    <option value="es">Spain</option>
  </>
);

const meta = {
  title: 'Components/Select',
  component: Select,
  args: { label: 'Country', placeholder: 'Select a country', children: countries },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const select = within(canvasElement).getByLabelText('Country');
    await expect(select).toHaveValue('');
    await userEvent.selectOptions(select, 'fr');
    await expect(select).toHaveValue('fr');
  },
};
export const WithValue: Story = { args: { defaultValue: 'de' } };
export const WithoutPlaceholder: Story = { args: { placeholder: undefined } };
export const WithHint: Story = { args: { hint: 'Used to calculate shipping.' } };
export const WithError: Story = { args: { error: 'Choose a country.', required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'it' } };

export const WithGroups: Story = {
  args: {
    label: 'Time zone',
    placeholder: 'Select a time zone',
    children: (
      <>
        <optgroup label="Europe">
          <option value="Europe/Rome">Rome</option>
          <option value="Europe/London">London</option>
        </optgroup>
        <optgroup label="Americas">
          <option value="America/New_York">New York</option>
          <option value="America/Los_Angeles" disabled>Los Angeles (unavailable)</option>
        </optgroup>
      </>
    ),
  },
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Select {...args} label="Placeholder" />
      <Select {...args} label="Selected" defaultValue="fr" />
      <Select {...args} label="Invalid" error="Required" />
      <Select {...args} label="Disabled" disabled defaultValue="it" />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('');
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Select label="Country" placeholder="Select a country" value={value} onChange={(e) => setValue(e.target.value)}>
        {countries}
      </Select>
      <span style={{ fontSize: 14 }}>Value: {value || '(none)'}</span>
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
