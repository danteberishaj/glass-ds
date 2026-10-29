import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Button } from '../Button';
import { TextField } from '../TextField';
import { DatePicker } from './DatePicker';

const day = (y: number, m: number, d: number) => new Date(y, m - 1, d, 12);

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  args: { label: 'Start date', locale: 'en-US', onValueChange: fn() },
  argTypes: {
    placement: { control: 'inline-radio', options: ['bottom-start', 'bottom-end', 'top-start', 'top-end'] },
  },
  decorators: [(Story) => <div style={{ width: 320 }}><Story /></div>],
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithValue: Story = { args: { defaultValue: day(2026, 10, 29) } };

export const WithHint: Story = { args: { hint: 'The first day of your booking.' } };

/** `clearable`: a "Clear date" button appears while a date is selected; Backspace/Delete on the field also clear. */
export const Clearable: Story = { args: { clearable: true, defaultValue: day(2026, 10, 29) } };

export const WithError: Story = {
  args: { error: 'Pick a date after today.', defaultValue: day(2020, 1, 1), required: true },
};

export const Disabled: Story = { args: { disabled: true, defaultValue: day(2026, 10, 29) } };

export const MinMax: Story = {
  args: {
    hint: 'Within the next two weeks, weekdays only.',
    min: day(2026, 10, 29),
    max: day(2026, 11, 12),
    defaultValue: day(2026, 11, 2),
    isDateDisabled: (d: Date) => d.getDay() === 0 || d.getDay() === 6,
  },
};

export const LongFormat: Story = {
  args: { defaultValue: day(2026, 10, 29), format: { dateStyle: 'full' } },
};

export const InForm: Story = {
  render: function Render(args) {
    const [submitted, setSubmitted] = useState('');
    return (
      <form
        style={{ display: 'grid', gap: 16 }}
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(String(new FormData(e.currentTarget).get('checkin') ?? ''));
        }}
      >
        <TextField label="Guest" defaultValue="Ada Lovelace" name="guest" />
        <DatePicker {...args} label="Check-in" name="checkin" defaultValue={day(2026, 11, 6)} />
        <Button variant="solid" type="submit">
          Book
        </Button>
        <p style={{ margin: 0, fontSize: 14 }}>
          Submitted checkin: <output>{submitted || '—'}</output>
        </p>
      </form>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Book' }));
    await expect(canvas.getByRole('status')).toHaveTextContent('2026-11-06');
  },
};

/** Sits at the bottom of the viewport: the calendar flips above the field. */
export const NearBottomOfViewport: Story = {
  decorators: [(Story) => <div style={{ position: 'fixed', insetInline: 24, bottom: 24, width: 320 }}><Story /></div>],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: /Start date/ }));
    const popover = await canvas.findByRole('dialog', { name: 'Choose date' });
    await waitFor(() => expect(popover.dataset.placement).toBe('top-start'));
    const trigger = canvas.getByRole('button', { name: /Start date/ });
    await expect(popover.getBoundingClientRect().bottom).toBeLessThanOrEqual(trigger.getBoundingClientRect().top);
    await userEvent.keyboard('{Escape}');
  },
};

export const PickADate: Story = {
  args: { defaultValue: day(2026, 10, 15) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Start date Oct 15, 2026' });
    await userEvent.click(trigger);
    const popover = await canvas.findByRole('dialog', { name: 'Choose date' });
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(true));
    await waitFor(() => expect(within(popover).getByRole('button', { name: 'Thursday, October 15, 2026' })).toHaveFocus());
    await userEvent.click(within(popover).getByRole('button', { name: 'Thursday, October 22, 2026' }));
    await expect(args.onValueChange).toHaveBeenLastCalledWith(day(2026, 10, 22));
    await expect(trigger).toHaveTextContent('Oct 22, 2026');
    await waitFor(() => expect(popover.matches(':popover-open')).toBe(false));
    await expect(trigger).toHaveFocus();
  },
};

export const OnPlainBackground: Story = {
  args: { defaultValue: day(2026, 10, 29) },
  parameters: { backdrop: 'plain' },
};
