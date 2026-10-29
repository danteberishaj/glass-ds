import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState, type FormEvent } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { installPopoverPolyfill, isPopoverOpen as isOpen, uninstallPopoverPolyfill } from '../../test/popover-polyfill';
import { Dialog, DialogTitle } from '../Dialog';
import { DatePicker, type DatePickerProps } from './DatePicker';

// The Popover API stand-in is installed for every test file by src/test/setup.ts (src/test/popover-polyfill.ts).

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

function renderPicker(props: Partial<DatePickerProps> = {}) {
  return render(<DatePicker label="Start date" locale="en-US" weekStartsOn={1} {...props} />);
}

describe('DatePicker', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 29, 9, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('renders a labelled trigger that controls a closed dialog popover', () => {
    renderPicker();
    const trigger = screen.getByRole('button', { name: 'Start date Pick a date' });
    const popover = document.getElementById(trigger.getAttribute('aria-controls')!)!;
    expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveAttribute('popovertarget', popover.id);
    expect(trigger).toHaveAttribute('type', 'button');
    expect(popover).toHaveAttribute('popover', 'auto');
    expect(popover).toHaveAttribute('role', 'dialog');
    expect(popover).toHaveAttribute('aria-label', 'Choose date');
    expect(popover).toHaveAttribute('aria-modal', 'false');
    expect(isOpen(popover)).toBe(false);
  });

  it('clicking the label activates the trigger', async () => {
    renderPicker();
    await userEvent.click(screen.getByText('Start date'));
    expect(screen.getByRole('button', { name: /Start date/ })).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens, focuses today, picks a date, closes and returns focus', async () => {
    const onValueChange = vi.fn();
    renderPicker({ onValueChange });
    const trigger = screen.getByRole('button', { name: /Start date/ });
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    const popover = screen.getByRole('dialog', { name: 'Choose date' });
    expect(isOpen(popover)).toBe(true);
    expect(screen.getByRole('button', { name: 'Thursday, October 29, 2026' })).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenCalledWith(day(2026, 10, 30));
    expect(isOpen(popover)).toBe(false);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleName('Start date Oct 30, 2026');
    expect(trigger).not.toHaveAttribute('data-placeholder');
  });

  it('opens on the selected day’s month and focuses it', async () => {
    renderPicker({ defaultValue: day(2025, 2, 14) });
    await userEvent.click(screen.getByRole('button', { name: 'Start date Feb 14, 2025' }));
    expect(screen.getByRole('grid', { name: 'February 2025' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Friday, February 14, 2025' })).toHaveFocus();
  });

  it('resets the visible month each time it opens', async () => {
    renderPicker({ defaultValue: day(2026, 10, 1) });
    const trigger = screen.getByRole('button', { name: /Start date/ });
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await userEvent.click(trigger);
    expect(screen.getByRole('grid', { name: 'October 2026' })).toBeInTheDocument();
  });

  it('closes on Escape and restores focus to the trigger', async () => {
    renderPicker();
    const trigger = screen.getByRole('button', { name: /Start date/ });
    await userEvent.click(trigger);
    const popover = screen.getByRole('dialog');
    await userEvent.keyboard('{Escape}');
    expect(isOpen(popover)).toBe(false);
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('Escape inside a Dialog closes only the picker', async () => {
    const onOpenChange = vi.fn();
    render(
      <Dialog open onOpenChange={onOpenChange}>
        <DialogTitle>Book</DialogTitle>
        <DatePicker label="Check-in" locale="en-US" />
      </Dialog>,
    );
    await userEvent.click(screen.getByRole('button', { name: /Check-in/ }));
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Check-in/ })).toHaveFocus();
  });

  it('syncs state when the browser closes it and restores focus that was inside', async () => {
    renderPicker();
    const trigger = screen.getByRole('button', { name: /Start date/ });
    await userEvent.click(trigger);
    // e.g. a close watcher (Android back) or another auto popover opening.
    act(() => screen.getByRole('dialog').hidePopover());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('closes without stealing focus when focus moves elsewhere (light dismiss)', async () => {
    renderPicker();
    const trigger = screen.getByRole('button', { name: /Start date/ });
    await userEvent.click(trigger);
    const outside = document.createElement('button');
    document.body.append(outside);
    act(() => outside.focus());
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(outside).toHaveFocus();
    outside.remove();
  });

  it('closes when focus tabs out of the popover', async () => {
    render(
      <>
        <DatePicker label="Start date" locale="en-US" />
        <button type="button">After</button>
      </>,
    );
    const trigger = screen.getByRole('button', { name: /Start date/ });
    await userEvent.click(trigger);
    fireEvent.blur(screen.getByRole('button', { name: 'Thursday, October 29, 2026' }), {
      relatedTarget: screen.getByRole('button', { name: 'After' }),
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('formats with the format option and locale', () => {
    render(
      <DatePicker
        label="Datum"
        locale="de-DE"
        defaultValue={day(2026, 10, 29)}
        format={{ weekday: 'short', day: 'numeric', month: 'long' }}
      />,
    );
    expect(screen.getByRole('button', { name: 'Datum Do., 29. Oktober' })).toBeInTheDocument();
  });

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState<Date | null>(day(2026, 10, 1));
      return (
        <>
          <DatePicker label="Due" locale="en-US" value={value} onValueChange={setValue} />
          <button type="button" onClick={() => setValue(null)}>
            Clear
          </button>
        </>
      );
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Due Oct 1, 2026' }));
    await userEvent.click(screen.getByRole('button', { name: 'Friday, October 9, 2026' }));
    expect(screen.getByRole('button', { name: 'Due Oct 9, 2026' })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Clear' }));
    expect(screen.getByRole('button', { name: 'Due Pick a date' })).toHaveAttribute('data-placeholder');
  });

  it('submits YYYY-MM-DD through a hidden input', async () => {
    const onSubmit = vi.fn((e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      return new FormData(e.currentTarget).get('start');
    });
    render(
      <form onSubmit={onSubmit}>
        <DatePicker label="Start date" name="start" locale="en-US" defaultValue={day(2026, 1, 5)} />
        <button type="submit">Send</button>
      </form>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Send' }));
    expect(onSubmit).toHaveReturnedWith('2026-01-05');
  });

  it('wires hint and error, and marks invalid', () => {
    renderPicker({ hint: 'Weekdays only', error: 'Pick a later date', 'aria-describedby': 'external' });
    const trigger = screen.getByRole('button', { name: /Start date/ });
    expect(trigger).toHaveAttribute('aria-invalid', 'true');
    expect(trigger).toHaveAccessibleDescription('Weekdays only Pick a later date');
    expect(trigger.getAttribute('aria-describedby')).toMatch(/^external /);
  });

  it('respects a caller id and forwards ref and props to the trigger', () => {
    const ref = { current: null as HTMLButtonElement | null };
    renderPicker({ id: 'start', ref, 'data-testid': 'trigger' } as Partial<DatePickerProps>);
    expect(ref.current).toBe(screen.getByTestId('trigger'));
    expect(ref.current).toHaveAttribute('id', 'start');
    expect(ref.current).toHaveAttribute('aria-controls', 'start-popover');
  });

  it('does not open when disabled', async () => {
    renderPicker({ disabled: true });
    const trigger = screen.getByRole('button', { name: /Start date/ });
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
  });

  it('passes min/max and disabled dates to the calendar', async () => {
    renderPicker({ min: day(2026, 10, 10), isDateDisabled: (d) => d.getDate() === 20 });
    await userEvent.click(screen.getByRole('button', { name: /Start date/ }));
    expect(screen.getByRole('button', { name: 'Friday, October 9, 2026' })).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Tuesday, October 20, 2026' })).toHaveAttribute('aria-disabled', 'true');
  });

  it('clearable: clear button and Backspace/Delete clear the value and report null', async () => {
    const onValueChange = vi.fn();
    renderPicker({ clearable: true, defaultValue: day(2026, 10, 29), onValueChange });
    const trigger = screen.getByRole('button', { name: 'Start date Oct 29, 2026' });
    await userEvent.click(screen.getByRole('button', { name: 'Clear date' }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith(null);
    expect(trigger).toHaveAccessibleName('Start date Pick a date');
    expect(trigger).toHaveFocus();
    // hidden while empty
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
    await userEvent.keyboard('{Backspace}');
    expect(onValueChange).toHaveBeenCalledOnce();

    // pick again, then clear from the keyboard
    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('button', { name: 'Friday, October 9, 2026' }));
    expect(trigger).toHaveAccessibleName('Start date Oct 9, 2026');
    await userEvent.keyboard('{Delete}');
    expect(onValueChange).toHaveBeenLastCalledWith(null);
    expect(trigger).toHaveAccessibleName('Start date Pick a date');
  });

  it('without clearable, Backspace does nothing and no clear button renders', async () => {
    const onValueChange = vi.fn();
    renderPicker({ defaultValue: day(2026, 10, 29), onValueChange });
    expect(screen.queryByRole('button', { name: 'Clear date' })).toBeNull();
    screen.getByRole('button', { name: /Start date/ }).focus();
    await userEvent.keyboard('{Backspace}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('falls back to state when the Popover API is missing', async () => {
    uninstallPopoverPolyfill();
    try {
      renderPicker();
      const trigger = screen.getByRole('button', { name: /Start date/ });
      await userEvent.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      // jsdom's UA sheet hides [popover]; browsers without the API don't, and our CSS uses [data-open].
      expect(screen.getByRole('dialog', { hidden: true })).toHaveAttribute('data-open');
      await userEvent.keyboard('{Escape}');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveFocus();
    } finally {
      installPopoverPolyfill();
    }
  });

  it('has no a11y violations, closed and open', async () => {
    const { container } = render(
      <>
        <DatePicker label="Start" locale="en-US" hint="Hint" error="Error" required />
        <DatePicker label="End" locale="en-US" defaultValue={day(2026, 10, 2)} disabled />
      </>,
    );
    await expectNoA11yViolations(container);
    await userEvent.click(screen.getByRole('button', { name: /Start/ }));
    await expectNoA11yViolations(container);
  });
});
