import type { Meta, StoryObj } from '@storybook/react-vite';
import { Kbd } from './Kbd';

const meta = {
  title: 'Components/Kbd',
  component: Kbd,
  args: { children: 'K', size: 'md' },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md'] } },
} satisfies Meta<typeof Kbd>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

const showcase = (args: Story['args']) => (
  <div style={{ display: 'grid', gap: 16, fontSize: 14 }}>
    {(['sm', 'md'] as const).map((size) => (
      <div key={size} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <Kbd {...args} size={size} title="Command">⌘</Kbd>
        <Kbd {...args} size={size}>K</Kbd>
        <span style={{ marginInline: 8 }}>or</span>
        <Kbd {...args} size={size}>Ctrl</Kbd>
        <span>+</span>
        <Kbd {...args} size={size}>Shift</Kbd>
        <span>+</span>
        <Kbd {...args} size={size}>Enter</Kbd>
      </div>
    ))}
    <p style={{ margin: 0 }}>
      Press <Kbd {...args} size="sm">/</Kbd> to search.
    </p>
  </div>
);

export const Sizes: Story = { render: showcase };
export const OnPlainBackground: Story = { render: showcase, parameters: { backdrop: 'plain' } };
