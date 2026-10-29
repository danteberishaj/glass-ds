import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';
import { Radio, RadioGroup } from './RadioGroup';

const plans = (
  <>
    <Radio value="free" label="Free" hint="Up to 3 projects." />
    <Radio value="pro" label="Pro" hint="Unlimited projects and priority support." />
    <Radio value="team" label="Team" hint="Shared workspaces and SSO." />
  </>
);

const meta = {
  title: 'Components/RadioGroup',
  component: RadioGroup,
  subcomponents: { Radio },
  args: { label: 'Plan', defaultValue: 'pro', orientation: 'vertical', size: 'md', children: plans },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['vertical', 'horizontal'] },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByLabelText('Team'));
    await expect(canvas.getByLabelText('Team')).toBeChecked();
    await userEvent.keyboard('{ArrowUp}');
    await expect(canvas.getByLabelText('Pro')).toBeChecked();
  },
};

export const Unselected: Story = { args: { defaultValue: undefined } };
export const WithHint: Story = { args: { hint: 'You can change plans at any time.' } };
export const WithError: Story = { args: { defaultValue: undefined, required: true, error: 'Choose a plan to continue.' } };
export const Disabled: Story = { args: { disabled: true } };

export const DisabledOption: Story = {
  args: {
    children: (
      <>
        <Radio value="free" label="Free" />
        <Radio value="pro" label="Pro" />
        <Radio value="enterprise" label="Enterprise (contact sales)" disabled />
      </>
    ),
  },
};

export const Horizontal: Story = {
  args: {
    label: 'Notifications',
    orientation: 'horizontal',
    defaultValue: 'all',
    children: (
      <>
        <Radio value="all" label="All" />
        <Radio value="mentions" label="Mentions" />
        <Radio value="none" label="None" />
      </>
    ),
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 48 }}>
      <RadioGroup {...args} label="Small" size="sm" />
      <RadioGroup {...args} label="Medium" size="md" />
    </div>
  ),
};

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap' }}>
      <RadioGroup label="Default" defaultValue="b">
        <Radio value="a" label="Unchecked" />
        <Radio value="b" label="Checked" />
      </RadioGroup>
      <RadioGroup label="Invalid" error="Required">
        <Radio value="a" label="Option A" />
        <Radio value="b" label="Option B" />
      </RadioGroup>
      <RadioGroup label="Disabled" disabled defaultValue="b">
        <Radio value="a" label="Unchecked" />
        <Radio value="b" label="Checked" />
      </RadioGroup>
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState('comfortable');
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <RadioGroup label="Density" value={value} onValueChange={setValue}>
        <Radio value="compact" label="Compact" />
        <Radio value="comfortable" label="Comfortable" />
        <Radio value="spacious" label="Spacious" />
      </RadioGroup>
      <span style={{ fontSize: 14 }}>Selected: {value}</span>
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
