import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';
import { Pagination } from './Pagination';

const meta = {
  title: 'Components/Pagination',
  component: Pagination,
  args: { page: 6, totalPages: 12, siblingCount: 1, boundaryCount: 1, size: 'md', onPageChange: fn() },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    page: { control: { type: 'number', min: 1 } },
    totalPages: { control: { type: 'number', min: 0 } },
    siblingCount: { control: { type: 'number', min: 0, max: 3 } },
    boundaryCount: { control: { type: 'number', min: 0, max: 3 } },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Middle: Story = {};
export const Start: Story = { args: { page: 1 } };
export const End: Story = { args: { page: 12 } };
export const FewPages: Story = { args: { page: 2, totalPages: 4 } };
export const MoreSiblings: Story = { args: { page: 20, totalPages: 40, siblingCount: 2, boundaryCount: 2 } };

export const Sizes: Story = {
  render: (args) => (
    <div style={{ display: 'grid', gap: 16 }}>
      <Pagination {...args} size="sm" aria-label="Pagination (small)" />
      <Pagination {...args} size="md" aria-label="Pagination (medium)" />
    </div>
  ),
};

/** Link mode: `getHref` renders anchors, so it works from a Server Component. */
export const Links: Story = {
  args: { onPageChange: undefined, getHref: (page: number) => `?page=${page}` },
};

export const Interactive: Story = {
  render: function Render(args) {
    const [page, setPage] = useState(1);
    return (
      <Pagination
        {...args}
        page={page}
        onPageChange={(next) => {
          setPage(next);
          args.onPageChange?.(next);
        }}
      />
    );
  },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Next page' }));
    await expect(args.onPageChange).toHaveBeenLastCalledWith(2);
    await expect(canvas.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
    await userEvent.click(canvas.getByRole('button', { name: 'Page 12' }));
    await expect(canvas.getByRole('button', { name: 'Next page' })).toBeDisabled();
  },
};

export const OnPlainBackground: Story = { parameters: { backdrop: 'plain' } };
