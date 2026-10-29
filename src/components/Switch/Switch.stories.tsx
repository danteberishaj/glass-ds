import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Switch } from './Switch';

const meta = {
  title: 'Components/Switch',
  component: Switch,
  args: { label: 'Airplane mode', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const control = within(canvasElement).getByRole('switch');
    await userEvent.click(control);
    await expect(control).toBeChecked();
    await userEvent.keyboard(' ');
    await expect(control).not.toBeChecked();
  },
};
export const Checked: Story = { args: { defaultChecked: true } };
export const WithHint: Story = { args: { label: 'Reduce motion', hint: 'Turns off non-essential animation.' } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Switch {...args} size="sm" label="Small" />
      <Switch {...args} size="md" label="Medium" defaultChecked />
    </div>
  ),
};

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: '16px 32px' }}>
      <Switch {...args} label="Off" />
      <Switch {...args} label="On" defaultChecked />
      <Switch {...args} label="Disabled off" disabled />
      <Switch {...args} label="Disabled on" disabled defaultChecked />
      <Switch {...args} size="sm" label="Small off" />
      <Switch {...args} size="sm" label="Small on" defaultChecked />
    </div>
  ),
};

function ControlledDemo() {
  const [on, setOn] = useState(false);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Switch label="Wi-Fi" checked={on} onChange={(e) => setOn(e.target.checked)} />
      <span style={{ fontSize: 14 }}>Wi-Fi is {on ? 'on' : 'off'}</span>
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
