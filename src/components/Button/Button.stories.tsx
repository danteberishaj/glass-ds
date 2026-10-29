import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Button } from './Button';

const meta = {
  title: 'Components/Button',
  component: Button,
  args: { children: 'Button', variant: 'glass', size: 'md', loading: false, onClick: fn() },
  argTypes: {
    variant: { control: 'inline-radio', options: ['glass', 'solid', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Glass: Story = {};
export const Solid: Story = { args: { variant: 'solid' } };
export const Ghost: Story = { args: { variant: 'ghost' } };
export const Disabled: Story = { args: { disabled: true } };
/** `loading` keeps the button focusable (`aria-disabled`, `aria-busy`) and ignores clicks. */
export const Loading: Story = {
  args: { loading: true, children: 'Saving…' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button');
    await userEvent.click(button);
    await expect(args.onClick).not.toHaveBeenCalled();
    await expect(button).toHaveAttribute('aria-busy', 'true');
  },
};

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Button {...args} size="sm">Small</Button>
      <Button {...args} size="md">Medium</Button>
      <Button {...args} size="lg">Large</Button>
    </div>
  ),
};

/** Every variant in its resting, loading and disabled state. */
export const States: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: 12, alignItems: 'center' }}>
      {(['glass', 'solid', 'ghost'] as const).map((variant) => (
        <div key={variant} style={{ display: 'contents' }}>
          <Button {...args} variant={variant}>{variant}</Button>
          <Button {...args} variant={variant} loading>Saving…</Button>
          <Button {...args} variant={variant} disabled>Disabled</Button>
        </div>
      ))}
    </div>
  ),
};

export const ClickInteraction: Story = {
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'));
    await expect(args.onClick).toHaveBeenCalledOnce();
  },
};

export const OnPlainBackground: Story = { render: States.render, parameters: { backdrop: 'plain' } };
