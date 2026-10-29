import type { Meta, StoryObj } from '@storybook/react-vite';
import { Glass } from '../Glass';
import { Separator } from './Separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  args: { orientation: 'horizontal', decorative: true },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
  // The controls drive the separator itself; the surrounding content only changes direction.
  render: (args) => (
    <Glass
      style={{
        padding: 24,
        width: 320,
        display: 'flex',
        flexDirection: args.orientation === 'vertical' ? 'row' : 'column',
        alignItems: args.orientation === 'vertical' ? 'center' : 'stretch',
        gap: 16,
        fontSize: 14,
      }}
    >
      <span>Docs</span>
      <Separator {...args} />
      <span>Source</span>
    </Glass>
  ),
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Vertical: Story = { args: { orientation: 'vertical' } };
/** `decorative={false}` keeps the native separator role (plus `aria-orientation` when vertical). */
export const Semantic: Story = { args: { decorative: false } };

export const InContext: Story = {
  render: (args) => (
    <Glass style={{ padding: 24, width: 320, display: 'grid', gap: 16 }}>
      <div>
        <div style={{ fontWeight: 600 }}>Glass DS</div>
        <div style={{ fontSize: 14, opacity: 0.8 }}>A glassmorphism design system.</div>
      </div>
      <Separator {...args} orientation="horizontal" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, height: 20 }}>
        <span>Docs</span>
        <Separator {...args} orientation="vertical" />
        <span>Source</span>
        <Separator {...args} orientation="vertical" />
        <span>Blog</span>
      </div>
    </Glass>
  ),
};

export const OnPlainBackground: Story = { render: InContext.render, parameters: { backdrop: 'plain' } };
