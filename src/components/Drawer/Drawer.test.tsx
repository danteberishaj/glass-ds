import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Button } from '../Button';
import { Drawer, DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, type DrawerProps } from './Drawer';


function Example({ onOpenChange, ...props }: Partial<DrawerProps>) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Open</Button>
      <Drawer
        {...props}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          onOpenChange?.(next);
        }}
      >
        <DrawerClose />
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow down the results.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>Body</DrawerBody>
        <DrawerFooter>
          <DrawerClose>Done</DrawerClose>
        </DrawerFooter>
      </Drawer>
    </>
  );
}

const drawer = () => document.querySelector('dialog') as HTMLDialogElement;

describe('Drawer', () => {
  it('defaults to the right side, md size, strong glass', () => {
    render(<Example />);
    expect(drawer()).toHaveAttribute('data-side', 'right');
    expect(drawer()).toHaveAttribute('data-size', 'md');
    expect(drawer()).toHaveAttribute('data-intensity', 'strong');
    expect(drawer()).toHaveClass('gds-glass', 'root', 'drawer');
  });

  it.each(['left', 'right', 'top', 'bottom'] as const)('renders side="%s"', (side) => {
    render(<Example side={side} />);
    expect(drawer()).toHaveAttribute('data-side', side);
  });

  it('opens modally and closes on Escape and DrawerClose', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const onOpenChange = vi.fn();
    render(<Example onOpenChange={onOpenChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    expect(showModal).toHaveBeenCalledOnce();
    const dialog = screen.getByRole('dialog', { name: 'Filters' });
    expect(dialog).toHaveAccessibleDescription('Narrow down the results.');

    await userEvent.type(screen.getByRole('button', { name: 'Done' }), '{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    expect(drawer()).not.toHaveAttribute('open');

    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(screen.getByRole('button', { name: 'Done' }));
    expect(drawer()).not.toHaveAttribute('open');
    showModal.mockRestore();
  });

  it('has no a11y violations when open', async () => {
    const { container } = render(<Example side="left" />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await expectNoA11yViolations(container);
  });
});
