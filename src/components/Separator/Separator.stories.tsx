import type { Meta, StoryObj } from '@storybook/react-vite';
import { Glass } from '../Glass';
import { Separator } from './Separator';

const meta = {
  title: 'Components/Separator',
  component: Separator,
  args: { orientation: 'horizontal', decorative: true },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
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
} satisfies Meta<typeof Separator>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
/** `decorative={false}` exposes role="separator" with aria-orientation. */
export const Semantic: Story = { args: { decorative: false } };
export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
