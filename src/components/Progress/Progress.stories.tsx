import type { Meta, StoryObj } from '@storybook/react-vite';
import { Progress, type ProgressSize, type ProgressTone } from './Progress';

const tones: ProgressTone[] = ['accent', 'success', 'warning', 'danger', 'info'];
const sizes: ProgressSize[] = ['sm', 'md', 'lg'];

const meta = {
  title: 'Components/Progress',
  component: Progress,
  args: { value: 64, label: 'Uploading files', showValue: true, tone: 'accent', size: 'md' },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100 } },
    tone: { control: 'select', options: tones },
    size: { control: 'inline-radio', options: sizes },
  },
  decorators: [(Story) => <div style={{ width: 360, maxWidth: '100%' }}><Story /></div>],
} satisfies Meta<typeof Progress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Indeterminate: Story = { args: { value: null, label: 'Preparing export' } };
/** No visible label: name it with aria-label. */
export const WithoutVisibleLabel: Story = { args: { label: undefined, showValue: false, 'aria-label': 'Profile completion' } };
export const WithValueText: Story = { args: { value: 3, max: 8, valueText: '3 of 8 files', label: 'Syncing' } };

const grid = () => (
  <div style={{ display: 'grid', gap: 20 }}>
    {tones.map((tone, i) => (
      <Progress key={tone} tone={tone} value={20 + i * 18} label={tone} showValue />
    ))}
    {sizes.map((size) => (
      <Progress key={size} size={size} value={48} label={`Size ${size}`} showValue />
    ))}
    <Progress value={null} label="Indeterminate" />
  </div>
);

export const AllTonesAndSizes: Story = { render: grid };
export const OnPlainBackground: Story = { render: grid, parameters: { backdrop: 'plain' } };
