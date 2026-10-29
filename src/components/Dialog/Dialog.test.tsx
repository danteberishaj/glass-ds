import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Button } from '../Button';
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


function Example(props: Partial<DialogProps>) {
  return (
    <Dialog {...props}>
      <DialogHeader>
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription>Changes are saved to your account.</DialogDescription>
      </DialogHeader>
      <DialogBody>
        <label htmlFor="n">Name</label>
        <input id="n" />
      </DialogBody>
      <DialogFooter>
        <DialogClose>Cancel</DialogClose>
      </DialogFooter>
      <DialogClose />
    </Dialog>
  );
}

function Controlled({ onOpenChange, ...props }: Partial<DialogProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Example
        {...props}
        open={open}
        onOpenChange={(next, details) => {
          setOpen(next);
          onOpenChange?.(next, details);
        }}
      />
    </>
  );
}

const dialog = () => document.querySelector('dialog') as HTMLDialogElement;

describe('Dialog', () => {
  it('renders closed, with title and description wired to aria attributes', () => {
    render(<Example />);
    const el = dialog();
    expect(el).not.toHaveAttribute('open');
    expect(el).toHaveClass('gds-glass');
    expect(el).toHaveAttribute('data-size', 'md');
    const title = screen.getByText('Edit profile');
    const description = screen.getByText('Changes are saved to your account.');
    expect(el).toHaveAttribute('aria-labelledby', title.id);
    expect(el).toHaveAttribute('aria-describedby', description.id);
  });

  it('is named and described by its title and description when open', () => {
    render(<Example defaultOpen />);
    const el = screen.getByRole('dialog');
    expect(el).toHaveAccessibleName('Edit profile');
    expect(el).toHaveAccessibleDescription('Changes are saved to your account.');
  });

  it('always points aria-labelledby/aria-describedby at the generated ids (no state round-trip)', () => {
    render(
      <Dialog defaultOpen>
        <DialogTitle>Only a title</DialogTitle>
      </Dialog>,
    );
    const el = screen.getByRole('dialog', { name: 'Only a title' });
    expect(el).toHaveAttribute('aria-labelledby', screen.getByText('Only a title').id);
    expect(el).toHaveAttribute('aria-describedby');
    expect(el).not.toHaveAccessibleDescription();
  });

  it('warns once in development when opened without a DialogTitle', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(<Dialog open>Untitled</Dialog>);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0]?.[0]).toMatch(/DialogTitle/);
    rerender(<Dialog open={false}>Untitled</Dialog>);
    rerender(<Dialog open>Untitled</Dialog>);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('moves initial focus to the panel, not the corner close button', async () => {
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const panel = screen.getByText('Edit profile').closest('[tabindex="-1"]');
    expect(panel).toBeInstanceOf(HTMLDivElement);
    expect(panel).toHaveFocus();
    expect(screen.getByRole('button', { name: 'Close' })).not.toHaveFocus();
  });

  it('closes an open dialog when unmounted without reporting it', () => {
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close');
    const onOpenChange = vi.fn();
    const { unmount } = render(<Example open onOpenChange={onOpenChange} />);
    expect(dialog()).toHaveAttribute('open');
    unmount();
    expect(close).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
    close.mockRestore();
  });

  it('opens with showModal() and closes with close() following the open prop', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const close = vi.spyOn(HTMLDialogElement.prototype, 'close');
    const onOpenChange = vi.fn();
    render(<Controlled onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog()).toHaveAttribute('open');

    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(close).toHaveBeenCalled();
    expect(dialog()).not.toHaveAttribute('open');
    // closing through the prop must not report a second close
    expect(onOpenChange.mock.calls).toEqual([[false, { reason: 'close' }]]);
    showModal.mockRestore();
    close.mockRestore();
  });

  it('uses show() when modal={false}', () => {
    const show = vi.spyOn(HTMLDialogElement.prototype, 'show');
    render(<Example open modal={false} />);
    expect(show).toHaveBeenCalledOnce();
    show.mockRestore();
  });

  it('closes on Escape when dismissible', async () => {
    const onOpenChange = vi.fn();
    render(<Controlled onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.type(screen.getByLabelText('Name'), '{Escape}');
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, { reason: 'escape' });
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('ignores a second close request once the element is closed (keydown + cancel)', () => {
    const onOpenChange = vi.fn();
    render(<Example open onOpenChange={onOpenChange} />);
    fireEvent.keyDown(dialog(), { key: 'Escape' });
    // the owner closed it; the browser's follow-up `cancel` must not report again
    act(() => dialog().close());
    onOpenChange.mockClear();
    act(() => {
      dialog().dispatchEvent(new Event('cancel', { cancelable: true }));
    });
    fireEvent.keyDown(dialog(), { key: 'Escape' });
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('closeOnEscape={false} keeps Esc out but still closes on the backdrop', async () => {
    const onOpenChange = vi.fn();
    render(<Controlled closeOnEscape={false} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(dialog()).toHaveAttribute('closedby', 'none');
    await userEvent.type(screen.getByLabelText('Name'), '{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, { reason: 'backdrop' });
  });

  it('closeOnBackdropClick={false} keeps the backdrop out but still closes on Esc', async () => {
    const onOpenChange = vi.fn();
    render(<Controlled closeOnBackdropClick={false} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(dialog()).not.toHaveAttribute('closedby');
    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());
    expect(onOpenChange).not.toHaveBeenCalled();
    await userEvent.type(screen.getByLabelText('Name'), '{Escape}');
    expect(onOpenChange).toHaveBeenCalledExactlyOnceWith(false, { reason: 'escape' });
  });

  it('handles the native cancel event (close requests) without closing behind the owner', () => {
    const onOpenChange = vi.fn();
    render(<Example open onOpenChange={onOpenChange} />);
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      dialog().dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'escape' });
  });

  it('closes on backdrop click, not on clicks inside the panel', async () => {
    const onOpenChange = vi.fn();
    render(<Controlled onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByLabelText('Name'));
    expect(onOpenChange).not.toHaveBeenCalled();
    // events on ::backdrop target the <dialog> itself
    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'backdrop' });
  });

  it('ignores Escape, cancel and backdrop when dismissible={false}', async () => {
    const onOpenChange = vi.fn();
    render(<Controlled dismissible={false} onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(dialog()).toHaveAttribute('closedby', 'none');
    await userEvent.type(screen.getByLabelText('Name'), '{Escape}');
    const cancel = new Event('cancel', { cancelable: true });
    act(() => {
      dialog().dispatchEvent(cancel);
    });
    expect(cancel.defaultPrevented).toBe(true);
    fireEvent.pointerDown(dialog());
    fireEvent.click(dialog());
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(dialog()).toHaveAttribute('open');
    // explicit controls still close it
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'close' });
  });

  it('reports a native close (e.g. form method="dialog") through onOpenChange', () => {
    const onOpenChange = vi.fn();
    render(<Example open onOpenChange={onOpenChange} />);
    act(() => dialog().close());
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'native' });
  });

  it('works uncontrolled with defaultOpen', async () => {
    render(<Example defaultOpen />);
    expect(dialog()).toHaveAttribute('open');
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(dialog()).not.toHaveAttribute('open');
  });

  it('lets DialogClose onClick veto with preventDefault', async () => {
    render(
      <Dialog defaultOpen>
        <DialogTitle>T</DialogTitle>
        <DialogClose onClick={(e) => e.preventDefault()}>Stay</DialogClose>
      </Dialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Stay' }));
    expect(dialog()).toHaveAttribute('open');
  });

  it('forwards refs and merges className', () => {
    const ref = createRef<HTMLDialogElement>();
    render(<Example ref={ref} className="custom" size="lg" />);
    expect(ref.current).toBe(dialog());
    expect(dialog()).toHaveClass('custom', 'root', 'dialog');
    expect(dialog()).toHaveAttribute('data-size', 'lg');
  });

  it('throws a helpful error when a part is used outside a dialog', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<DialogTitle>Lost</DialogTitle>)).toThrow(/inside <Dialog>/);
    vi.mocked(console.error).mockRestore();
  });

  it('has no a11y violations when open', async () => {
    const { container } = render(<Example defaultOpen />);
    await expectNoA11yViolations(container);
  });
});
