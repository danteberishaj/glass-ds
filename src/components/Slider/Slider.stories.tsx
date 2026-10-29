import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fireEvent, within } from 'storybook/test';
import { Slider } from './Slider';

const meta = {
  title: 'Components/Slider',
  component: Slider,
  args: { label: 'Volume', defaultValue: 40, min: 0, max: 100, step: 1, showValue: true },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const slider = canvas.getByRole('slider', { name: 'Volume' });
    // Synthetic key events never step a native range input (only trusted ones do), so drive the
    // value directly: that still goes through the component's onChange → fill + output path.
    await fireEvent.input(slider, { target: { value: '41' } });
    await expect(slider).toHaveValue('41');
    await expect(canvas.getByText('41', { selector: 'output' })).toBeInTheDocument();
  },
};
export const WithoutValue: Story = { args: { showValue: false } };
export const Formatted: Story = {
  args: { label: 'Opacity', defaultValue: 0.6, min: 0, max: 1, step: 0.05, formatValue: (v) => `${Math.round(v * 100)}%` },
};
export const WithHint: Story = { args: { label: 'Blur', hint: 'Higher values cost more on mobile.' } };
export const Disabled: Story = { args: { disabled: true } };
export const Empty: Story = { args: { defaultValue: 0 } };
export const Full: Story = { args: { defaultValue: 100 } };

export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 24 }}>
      <Slider {...args} label="Empty" defaultValue={0} />
      <Slider {...args} label="Partial" defaultValue={35} />
      <Slider {...args} label="Full" defaultValue={100} />
      <Slider {...args} label="Stepped" defaultValue={50} step={10} hint="Steps of 10" />
      <Slider {...args} label="Disabled" defaultValue={60} disabled />
    </div>
  ),
};

function ControlledDemo() {
  const [value, setValue] = useState(25);
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Slider label="Brightness" value={value} onValueChange={setValue} showValue formatValue={(v) => `${v}%`} />
      <button type="button" onClick={() => setValue(50)}>Reset to 50%</button>
    </div>
  );
}

export const Controlled: Story = { render: () => <ControlledDemo /> };

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
