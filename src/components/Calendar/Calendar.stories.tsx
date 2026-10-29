import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Calendar } from './Calendar';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  args: { locale: 'en-US', onValueChange: fn(), onMonthChange: fn() },
  argTypes: {
    weekStartsOn: { control: { type: 'select' }, options: [undefined, 0, 1, 2, 3, 4, 5, 6] },
    surface: { control: 'inline-radio', options: ['glass', 'none'] },
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithSelectedValue: Story = { args: { defaultValue: day(2026, 10, 14) } };

export const MinMax: Story = {
  args: { defaultMonth: day(2026, 10, 1), min: day(2026, 10, 6), max: day(2026, 11, 20) },
};

export const DisabledWeekends: Story = { args: { isDateDisabled: isWeekend, defaultMonth: day(2026, 10, 1) } };

export const WeekStartsOnSunday: Story = { args: { weekStartsOn: 0, locale: 'en-GB' } };

export const HiddenOutsideDays: Story = { args: { showOutsideDays: false } };

export const Locales: Story = {
  render: (args) => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center' }}>
      <Calendar {...args} locale="de-DE" aria-label="Deutsch" defaultValue={day(2026, 10, 3)} />
      <div dir="rtl">
        <Calendar {...args} locale="ar-EG" aria-label="العربية" defaultValue={day(2026, 10, 3)} />
      </div>
      <Calendar {...args} locale="ja-JP" aria-label="日本語" defaultValue={day(2026, 10, 3)} />
    </div>
  ),
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<Date | null>(day(2026, 10, 29));
    const [month, setMonth] = useState(day(2026, 10, 1));
    return (
      <div style={{ display: 'grid', gap: 12, justifyItems: 'center' }}>
        <Calendar
          {...args}
          value={value}
          month={month}
          onValueChange={(next) => {
            setValue(next);
            args.onValueChange?.(next);
          }}
          onMonthChange={(next) => {
            setMonth(next);
            args.onMonthChange?.(next);
          }}
        />
        <p style={{ margin: 0, fontSize: 14 }}>
          Selected: <strong>{value?.toDateString() ?? 'none'}</strong>
        </p>
      </div>
    );
  },
};

export const KeyboardNavigation: Story = {
  args: { defaultValue: day(2026, 10, 15) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const start = canvas.getByRole('button', { name: 'Thursday, October 15, 2026' });
    start.focus();
    await userEvent.keyboard('{ArrowRight}');
    const next = canvas.getByRole('button', { name: 'Friday, October 16, 2026' });
    await expect(next).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(next.closest('td')).toHaveAttribute('aria-selected', 'true');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(day(2026, 10, 16));
    // Crossing the month boundary pages the grid and keeps focus on the day.
    await userEvent.keyboard('{PageDown}');
    await expect(canvas.getByRole('grid', { name: 'November 2026' })).toBeInTheDocument();
    await expect(canvas.getByRole('button', { name: 'Monday, November 16, 2026' })).toHaveFocus();
  },
};

export const OnPlainBackground: Story = { args: { defaultValue: day(2026, 10, 14) }, parameters: { backdrop: 'plain' } };
