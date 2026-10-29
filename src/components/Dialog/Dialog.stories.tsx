import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { TextField } from '../TextField';
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  type DialogProps,
} from './Dialog';

/** Trigger + controlled dialog with a form. Submitting closes it; so do Esc, backdrop, ✕ and Cancel. */
function FormDialog(args: DialogProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Edit profile</Button>
      <Dialog {...args} open={open} onOpenChange={setOpen}>
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription>Update how others see you. Changes apply immediately.</DialogDescription>
        </DialogHeader>
        <form
          id="profile-form"
          style={{ display: 'contents' }}
          onSubmit={(e) => {
            e.preventDefault();
            setOpen(false);
          }}
        >
          <DialogBody style={{ display: 'grid', gap: 16 }}>
            <TextField label="Name" defaultValue="Ada Lovelace" />
            <TextField label="Username" defaultValue="@ada" hint="Letters, numbers and underscores." />
          </DialogBody>
        </form>
        <DialogFooter>
          <DialogClose>Cancel</DialogClose>
          <Button variant="solid" type="submit" form="profile-form">
            Save changes
          </Button>
        </DialogFooter>
        {/* Last in DOM order: screen readers reach the title and content before the close control. */}
        <DialogClose />
      </Dialog>
    </>
  );
}

const meta = {
  title: 'Components/Dialog',
  component: Dialog,
  subcomponents: { DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose },
  args: { size: 'md', modal: true, dismissible: true },
  argTypes: { size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] } },
  render: (args) => <FormDialog {...args} />,
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Edit profile' });
    await userEvent.click(trigger);
    const dialog = await canvas.findByRole('dialog', { name: 'Edit profile' });
    await expect(dialog).toHaveAttribute('open');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const Small: Story = { args: { size: 'sm' } };
export const Large: Story = { args: { size: 'lg' } };

/** Esc and backdrop clicks do nothing: the user must choose an action. */
export const NonDismissible: Story = {
  args: { dismissible: false, size: 'sm' },
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Delete project</Button>
        <Dialog {...args} open={open} onOpenChange={setOpen} role="alertdialog">
          <DialogHeader>
            <DialogTitle>Delete this project?</DialogTitle>
            <DialogDescription>All files and settings are removed. This can't be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>Keep project</DialogClose>
            <Button variant="solid" onClick={() => setOpen(false)}>
              Delete
            </Button>
          </DialogFooter>
        </Dialog>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Delete project' }));
    const dialog = await canvas.findByRole('alertdialog', { name: 'Delete this project?' });
    await userEvent.keyboard('{Escape}');
    await expect(dialog).toHaveAttribute('open');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Keep project' }));
    await waitFor(() => expect(dialog).not.toHaveAttribute('open'));
  },
};

/** Long content: the body scrolls, header and footer stay visible. */
export const ScrollingBody: Story = {
  render: function Render(args) {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button onClick={() => setOpen(true)}>Read terms</Button>
        <Dialog {...args} open={open} onOpenChange={setOpen}>
          <DialogHeader>
            <DialogTitle>Terms of service</DialogTitle>
          </DialogHeader>
          <DialogBody>
            {Array.from({ length: 12 }, (_, i) => (
              <p key={i}>
                Section {i + 1}. You agree to use the service responsibly and to keep your account details safe.
                We may update these terms and will tell you when we do.
              </p>
            ))}
          </DialogBody>
          <DialogFooter>
            <DialogClose variant="solid">I agree</DialogClose>
          </DialogFooter>
          <DialogClose />
        </Dialog>
      </>
    );
  },
};

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
