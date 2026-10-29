import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { TextField } from './TextField';

const meta = {
  title: 'Components/TextField',
  component: TextField,
  args: { label: 'Email', placeholder: 'you@example.com', type: 'email', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: 'We never share your email.' } };
export const WithError: Story = { args: { error: 'Enter a valid email address.', defaultValue: 'nope' } };
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true } };
/** The label stays for screen readers; use when the surrounding UI already says what the field is. */
export const HiddenLabel: Story = { args: { label: 'Search', hideLabel: true, type: 'search', placeholder: 'Search…' } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <TextField {...args} size="sm" label="Small" />
      <TextField {...args} size="md" label="Medium" />
      <TextField {...args} size="lg" label="Large" />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 20 }}>
      <TextField {...args} label="Default" />
      <TextField {...args} label="With hint" hint="We never share your email." />
      <TextField {...args} label="Required" required />
      <TextField {...args} label="Invalid" error="Enter a valid email address." defaultValue="nope" />
      <TextField {...args} label="Disabled" disabled defaultValue="ada@example.com" />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('');
  return (
    <TextField
      label="Username"
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
      hint={value ? `Will be shown as @${value}` : 'Lowercase; spaces become dashes.'}
    />
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
