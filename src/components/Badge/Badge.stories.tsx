import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge, type BadgeTone, type BadgeVariant } from './Badge';

const variants: BadgeVariant[] = ['glass', 'solid', 'outline'];
const tones: BadgeTone[] = ['neutral', 'accent', 'success', 'warning', 'danger', 'info'];

const meta = {
  title: 'Components/Badge',
  component: Badge,
  args: { children: 'Badge', variant: 'glass', tone: 'neutral', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: variants },
    tone: { control: 'select', options: tones },
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const grid = (args: Story['args']) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${tones.length}, auto)`, gap: 12, alignItems: 'center' }}>
    {variants.flatMap((variant) =>
      tones.map((tone) => (
        <Badge key={`${variant}-${tone}`} {...args} variant={variant} tone={tone}>
          {tone}
        </Badge>
      )),
    )}
  </div>
);

export const AllVariantsAndTones: Story = { render: grid };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Badge {...args} size="sm">Small</Badge>
      <Badge {...args} size="md">Medium</Badge>
    </div>
  ),
};

export const OnPlainBackground: Story = { render: grid, parameters: { backdrop: 'plain' } };
