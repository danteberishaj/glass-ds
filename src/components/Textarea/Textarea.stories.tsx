import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Textarea } from './Textarea';

const meta = {
  title: 'Components/Textarea',
  component: Textarea,
  args: { label: 'Message', placeholder: 'Tell us what you think…', resize: 'vertical' },
  argTypes: { resize: { control: 'inline-radio', options: ['none', 'vertical', 'both'] } },
  decorators: [(Story) => <div style={{ width: 360 }}><Story /></div>],
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const field = within(canvasElement).getByLabelText('Message');
    await userEvent.type(field, 'Hello');
    await expect(field).toHaveValue('Hello');
  },
};
export const WithHint: Story = { args: { hint: 'Markdown is supported.' } };
export const WithError: Story = { args: { error: 'A message is required.', required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: 'Read-only draft' } };
export const Tall: Story = { args: { rows: 8, resize: 'none' } };

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 20 }}>
      <Textarea {...args} label="Default" />
      <Textarea {...args} label="With hint" hint="Up to 500 characters." />
      <Textarea {...args} label="Invalid" error="Required" />
      <Textarea {...args} label="Disabled" disabled />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('');
  const max = 140;
  return (
    <Textarea
      label="Bio"
      value={value}
      maxLength={max}
      onChange={(e) => setValue(e.target.value)}
      hint={`${value.length}/${max} characters`}
    />
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
