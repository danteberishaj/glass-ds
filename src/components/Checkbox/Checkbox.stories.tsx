import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Checkbox } from './Checkbox';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { label: 'Accept terms and conditions', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const box = within(canvasElement).getByRole('checkbox');
    await userEvent.click(within(canvasElement).getByText('Accept terms and conditions'));
    await expect(box).toBeChecked();
  },
};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = { args: { label: 'Select all', indeterminate: true } };
export const WithHint: Story = { args: { hint: 'You can unsubscribe at any time.', label: 'Email me product updates' } };
export const WithError: Story = { args: { error: 'You must accept the terms to continue.', required: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Checkbox {...args} size="sm" label="Small" />
      <Checkbox {...args} size="md" label="Medium" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: '16px 32px' }}>
      <Checkbox {...args} label="Unchecked" />
      <Checkbox {...args} label="Checked" defaultChecked />
      <Checkbox {...args} label="Indeterminate" indeterminate />
      <Checkbox {...args} label="Invalid" error="Required" />
      <Checkbox {...args} label="Disabled" disabled />
      <Checkbox {...args} label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};

function SelectAllDemo() {
  const [items, setItems] = useState({ email: true, sms: false, push: false });
  const values = Object.values(items);
  const all = values.every(Boolean);
  const some = values.some(Boolean);
  const setAll = (checked: boolean) => setItems({ email: checked, sms: checked, push: checked });
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Checkbox label="All notifications" checked={all} indeterminate={some && !all} onChange={(e) => setAll(e.target.checked)} />
      <div style={{ display: 'grid', gap: 12, paddingInlineStart: 32 }}>
        {(Object.keys(items) as (keyof typeof items)[]).map((key) => (
          <Checkbox
            key={key}
            label={key.toUpperCase()}
            checked={items[key]}
            onChange={(e) => setItems((prev) => ({ ...prev, [key]: e.target.checked }))}
          />
        ))}
      </div>
    </div>
  );
}

/** Controlled parent with `indeterminate` derived from its children. */
export const Controlled: Story = { render: () => <SelectAllDemo /> };

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
