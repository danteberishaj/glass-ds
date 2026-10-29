import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { TextField } from '../TextField';
import {
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  type DrawerProps,
  type DrawerSide,
} from './Drawer';

function DrawerDemo({ label = 'Open filters', ...args }: DrawerProps & { label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>{label}</Button>
      <Drawer {...args} open={open} onOpenChange={setOpen}>
        <DrawerClose />
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow down the results.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <TextField label="Keyword" placeholder="e.g. glass" />
          <TextField label="Author" placeholder="Anyone" />
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose>Reset</DrawerClose>
          <DrawerClose variant="solid">Apply</DrawerClose>
        </DrawerFooter>
      </Drawer>
    </>
  );
}

const meta = {
  title: 'Components/Drawer',
  component: Drawer,
  subcomponents: { DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter, DrawerClose },
  args: { side: 'right', size: 'md', modal: true, dismissible: true },
  argTypes: {
    side: { control: 'inline-radio', options: ['left', 'right', 'top', 'bottom'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
  render: (args) => <DrawerDemo {...args} />,
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Right: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Open filters' });
    await userEvent.click(trigger);
    const drawer = await canvas.findByRole('dialog', { name: 'Filters' });
    await expect(drawer).toHaveAttribute('open');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(drawer).not.toHaveAttribute('open'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
export const Left: Story = { args: { side: 'left' } };
export const Top: Story = { args: { side: 'top', size: 'sm' } };
export const Bottom: Story = { args: { side: 'bottom', size: 'sm' } };

export const AllSides: Story = {
  render: (args) => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      {(['left', 'right', 'top', 'bottom'] as DrawerSide[]).map((side) => (
        <DrawerDemo key={side} {...args} side={side} size={side === 'top' || side === 'bottom' ? 'sm' : 'md'} label={side} />
      ))}
    </div>
  ),
};

export const Large: Story = { args: { size: 'lg' } };

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
