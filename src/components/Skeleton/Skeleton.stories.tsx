import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from '../Card';
import { Skeleton } from './Skeleton';

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  args: { width: 240, height: 16, radius: 'md' },
  argTypes: { radius: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'xl', 'full'] } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const cardPlaceholder = () => (
  <Card role="group" aria-busy="true" aria-label="Loading profile" style={{ width: 360 }}>
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Skeleton width={48} height={48} radius="full" />
      <div style={{ display: 'grid', gap: 8, flex: 1 }}>
        <Skeleton width="60%" height={14} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
    <Skeleton height={160} radius="lg" />
    <div style={{ display: 'grid', gap: 8 }}>
      <Skeleton height={12} />
      <Skeleton height={12} />
      <Skeleton width="75%" height={12} />
    </div>
    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <Skeleton width={80} height={40} />
      <Skeleton width={96} height={40} />
    </div>
  </Card>
);

export const CardPlaceholder: Story = { render: cardPlaceholder };

export const Shapes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, auto)', gap: 16, alignItems: 'center' }}>
      <Skeleton width={32} height={32} radius="full" />
      <Skeleton width={40} height={40} radius="full" />
      <Skeleton width={64} height={64} radius="full" />
      <Skeleton width={120} height={32} radius="md" />
      <Skeleton width={120} height={40} radius="md" />
      <Skeleton width={120} height={48} radius="md" />
      <Skeleton width={64} height={20} radius="full" />
      <Skeleton width={120} height={80} radius="lg" />
      <Skeleton width={120} height={80} radius="none" />
    </div>
  ),
};

export const OnPlainBackground: Story = { render: cardPlaceholder, parameters: { backdrop: 'plain' } };
