import type { Meta, StoryObj } from '@storybook/react-vite';
import { Glass } from './Glass';

const meta = {
  title: 'Foundations/Glass',
  component: Glass,
  args: {
    intensity: 'regular',
    radius: 'lg',
    elevation: 'flat',
    style: { padding: 32, width: 320 },
    children: 'Frosted glass surface',
  },
  argTypes: {
    intensity: { control: 'inline-radio', options: ['subtle', 'regular', 'strong'] },
    radius: { control: 'inline-radio', options: ['none', 'sm', 'md', 'lg', 'xl'] },
    elevation: { control: 'inline-radio', options: ['flat', 'raised'] },
  },
} satisfies Meta<typeof Glass>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Intensities: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {(['subtle', 'regular', 'strong'] as const).map((intensity) => (
        <Glass key={intensity} {...args} intensity={intensity} style={{ padding: 32, width: 200 }}>
          {intensity}
        </Glass>
      ))}
    </div>
  ),
};

export const Raised: Story = { args: { elevation: 'raised' } };

/** What users get with reduced transparency, high contrast, or no backdrop-filter support. */
export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };

export const AsSection: Story = { args: { as: 'section', 'aria-label': 'Glass section' } };
