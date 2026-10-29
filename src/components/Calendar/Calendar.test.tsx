import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Calendar, type CalendarProps } from './Calendar';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const cellButton = (name: string) => screen.getByRole('button', { name });

function renderCalendar(props: Partial<CalendarProps> = {}) {
  return render(<Calendar locale="en-US" weekStartsOn={1} {...props} />);
}

describe('Calendar', () => {
  beforeEach(() => {
    // Fake only Date, so user-event's timers keep working. "Today" is Thursday 2026-10-29.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 29, 9, 30));
  });
  afterEach(() => vi.useRealTimers());

  it('renders a labelled 6×7 grid with weekday column headers', () => {
    renderCalendar();
    const grid = screen.getByRole('grid', { name: 'October 2026' });
    const rows = within(grid).getAllByRole('row');
    expect(rows).toHaveLength(7); // header + 6 weeks, always
    const headers = within(grid).getAllByRole('columnheader');
    expect(headers).toHaveLength(7);
    expect(headers[0]).toHaveAttribute('abbr', 'Monday');
    expect(headers[0]).toHaveTextContent('Mon');
    expect(within(grid).getAllByRole('gridcell')).toHaveLength(42);
  });

  it('announces month changes through a polite live region', () => {
    renderCalendar();
    expect(screen.getByText('October 2026')).toHaveAttribute('aria-live', 'polite');
  });

  it('labels days with the full date and marks today', () => {
    renderCalendar();
    const today = cellButton('Thursday, October 29, 2026');
    expect(today).toHaveTextContent('29');
    expect(today).toHaveAttribute('aria-current', 'date');
    expect(cellButton('Wednesday, October 28, 2026')).not.toHaveAttribute('aria-current');
  });

  it('roving tabindex: selected day, else today, else the first enabled day of the month', () => {
    const { unmount } = renderCalendar({ defaultValue: day(2026, 10, 12) });
    expect(cellButton('Monday, October 12, 2026')).toHaveAttribute('tabindex', '0');
    expect(screen.getAllByRole('button').filter((b) => b.tabIndex === 0)).toHaveLength(3); // + prev/next
    unmount();

    renderCalendar();
    expect(cellButton('Thursday, October 29, 2026')).toHaveAttribute('tabindex', '0');
    cleanupAndRender({ defaultMonth: day(2026, 12, 1), min: day(2026, 12, 3) });
    expect(cellButton('Thursday, December 3, 2026')).toHaveAttribute('tabindex', '0');
  });

  it('selects on click and reports a noon-pinned date', async () => {
    const onValueChange = vi.fn();
    renderCalendar({ onValueChange });
    await userEvent.click(cellButton('Friday, October 16, 2026'));
    const picked = onValueChange.mock.calls[0]?.[0] as Date;
    expect([picked.getFullYear(), picked.getMonth(), picked.getDate(), picked.getHours()]).toEqual([2026, 9, 16, 12]);
    expect(cellButton('Friday, October 16, 2026').closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(cellButton('Friday, October 16, 2026')).toHaveAttribute('data-pop');
  });

  it('clicking an outside day selects it and shows its month', async () => {
    renderCalendar();
    await userEvent.click(cellButton('Sunday, November 1, 2026'));
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(cellButton('Sunday, November 1, 2026').closest('td')).toHaveAttribute('aria-selected', 'true');
  });

  it('moves focus with arrows, Home/End and Page keys, crossing months', async () => {
    renderCalendar({ defaultValue: day(2026, 10, 29) });
    await userEvent.tab(); // previous month button
    await userEvent.tab(); // next month button
    await userEvent.tab(); // the grid's tabbable day
    expect(cellButton('Thursday, October 29, 2026')).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    expect(cellButton('Friday, October 30, 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}{ArrowLeft}');
    expect(cellButton('Wednesday, October 28, 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(cellButton('Wednesday, October 21, 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(cellButton('Wednesday, October 28, 2026')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(cellButton('Monday, October 26, 2026')).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(cellButton('Sunday, November 1, 2026')).toHaveFocus();
    // End crossed into November: the visible month follows and focus stays on the day.
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(cellButton('Sunday, November 1, 2026')).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('grid').querySelector('tbody')).toHaveAttribute('data-direction', 'next');

    await userEvent.keyboard('{ArrowLeft}');
    expect(cellButton('Saturday, October 31, 2026')).toHaveFocus();
    expect(screen.getByRole('grid', { name: 'October 2026' }).querySelector('tbody')).toHaveAttribute(
      'data-direction',
      'prev',
    );

    await userEvent.keyboard('{PageUp}');
    expect(cellButton('Wednesday, September 30, 2026')).toHaveFocus(); // Oct 31 → Sep 30 (clamped)
    await userEvent.keyboard('{PageDown}');
    expect(cellButton('Friday, October 30, 2026')).toHaveFocus();
    await userEvent.keyboard('{Shift>}{PageDown}{/Shift}');
    expect(cellButton('Saturday, October 30, 2027')).toHaveFocus();
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
    expect(cellButton('Friday, October 30, 2026')).toHaveFocus();
  });

  it('selects the focused day with Enter and Space', async () => {
    const onValueChange = vi.fn();
    renderCalendar({ onValueChange });
    cellButton('Thursday, October 29, 2026').focus();
    await userEvent.keyboard('{ArrowRight}{Enter}');
    expect(onValueChange).toHaveBeenLastCalledWith(day(2026, 10, 30));
    await userEvent.keyboard('{ArrowRight} ');
    expect(onValueChange).toHaveBeenLastCalledWith(day(2026, 10, 31));
  });

  it('swaps left and right in RTL', async () => {
    render(
      <div dir="rtl" style={{ direction: 'rtl' }}>
        <Calendar locale="en-US" weekStartsOn={1} style={{ direction: 'rtl' }} />
      </div>,
    );
    // jsdom doesn't inherit `direction`, so set it on the grid itself as a browser would compute it.
    screen.getByRole('grid').style.direction = 'rtl';
    cellButton('Thursday, October 29, 2026').focus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(cellButton('Friday, October 30, 2026')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(cellButton('Thursday, October 29, 2026')).toHaveFocus();
  });

  it('keeps disabled days focusable but not selectable', async () => {
    const onValueChange = vi.fn();
    const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
    renderCalendar({ onValueChange, isDateDisabled: isWeekend });
    const saturday = cellButton('Saturday, October 31, 2026');
    expect(saturday).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(saturday);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(saturday.closest('td')).toHaveAttribute('aria-selected', 'false');

    cellButton('Friday, October 30, 2026').focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(saturday).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('respects min and max: out-of-range days are disabled, keys clamp, nav buttons stop', async () => {
    const onMonthChange = vi.fn();
    renderCalendar({ min: day(2026, 10, 5), max: day(2026, 10, 30), onMonthChange });
    expect(cellButton('Sunday, October 4, 2026')).toHaveAttribute('aria-disabled', 'true');
    expect(cellButton('Monday, October 5, 2026')).not.toHaveAttribute('aria-disabled');
    const prev = screen.getByRole('button', { name: 'Previous month' });
    const next = screen.getByRole('button', { name: 'Next month' });
    expect(prev).toHaveAttribute('aria-disabled', 'true');
    expect(next).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(next);
    expect(onMonthChange).not.toHaveBeenCalled();
    expect(next).toBeEnabled(); // stays focusable

    cellButton('Thursday, October 29, 2026').focus();
    await userEvent.keyboard('{PageDown}');
    expect(cellButton('Friday, October 30, 2026')).toHaveFocus();
    await userEvent.keyboard('{Shift>}{PageUp}{/Shift}');
    expect(cellButton('Monday, October 5, 2026')).toHaveFocus();
  });

  it('pages months with the header buttons and reports the 1st of the new month', async () => {
    const onMonthChange = vi.fn();
    renderCalendar({ onMonthChange });
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));
    expect(screen.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    expect(onMonthChange).toHaveBeenLastCalledWith(day(2026, 11, 1));
    expect(screen.getByRole('button', { name: 'Next month' })).toHaveFocus();
    expect(cellButton('Sunday, November 1, 2026')).toHaveAttribute('tabindex', '0');
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous month' }));
    expect(screen.getByRole('grid', { name: 'September 2026' })).toBeInTheDocument();
  });

  it('works with a controlled value and month', async () => {
    function Controlled() {
      const [value, setValue] = useState<Date | null>(day(2026, 3, 10));
      const [month, setMonth] = useState(day(2026, 3, 1));
      return (
        <>
          <Calendar locale="en-US" value={value} onValueChange={setValue} month={month} onMonthChange={setMonth} />
          <output>{value?.toDateString()}</output>
          <button type="button" onClick={() => setMonth(day(2027, 1, 1))}>
            Jump
          </button>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('grid', { name: 'March 2026' })).toBeInTheDocument();
    await userEvent.click(cellButton('Friday, March 20, 2026'));
    expect(screen.getByRole('status')).toHaveTextContent('Fri Mar 20 2026');
    await userEvent.click(screen.getByRole('button', { name: 'Jump' }));
    expect(screen.getByRole('grid', { name: 'January 2027' }).querySelector('tbody')).toHaveAttribute(
      'data-direction',
      'next',
    );
  });

  it('a controlled value without onValueChange does not change', async () => {
    renderCalendar({ value: day(2026, 10, 1) });
    await userEvent.click(cellButton('Friday, October 16, 2026'));
    expect(cellButton('Thursday, October 1, 2026').closest('td')).toHaveAttribute('aria-selected', 'true');
    expect(cellButton('Friday, October 16, 2026').closest('td')).toHaveAttribute('aria-selected', 'false');
  });

  it('can hide outside days', () => {
    renderCalendar({ showOutsideDays: false });
    expect(screen.queryByRole('button', { name: 'Sunday, November 1, 2026' })).not.toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
  });

  it('follows weekStartsOn and the locale', () => {
    const { unmount } = render(<Calendar locale="en-US" />);
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Sunday'); // en-US default
    unmount();
    render(<Calendar locale="de-DE" defaultMonth={day(2026, 10, 1)} />);
    expect(screen.getByRole('grid', { name: 'Oktober 2026' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader')[0]).toHaveAttribute('abbr', 'Montag');
    expect(screen.getByRole('button', { name: 'Donnerstag, 29. Oktober 2026' })).toBeInTheDocument();
  });

  it('focuses the active day on mount with autoFocus', () => {
    renderCalendar({ autoFocus: true, defaultValue: day(2026, 10, 3) });
    expect(cellButton('Saturday, October 3, 2026')).toHaveFocus();
  });

  it('applies the glass card only with surface="glass"', () => {
    const { container, rerender } = renderCalendar();
    expect(container.firstElementChild).toHaveClass('gds-glass');
    rerender(<Calendar locale="en-US" surface="none" />);
    expect(container.firstElementChild).not.toHaveClass('gds-glass');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <>
        <Calendar locale="en-US" defaultValue={day(2026, 10, 12)} aria-label="Departure" />
        <Calendar locale="en-US" min={day(2026, 10, 5)} showOutsideDays={false} isDateDisabled={(d) => d.getDay() === 0} />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});

function cleanupAndRender(props: Partial<CalendarProps>) {
  document.body.innerHTML = '';
  return renderCalendar(props);
}
