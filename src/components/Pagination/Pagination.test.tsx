import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { getPaginationRange } from './getPaginationRange';
import { Pagination } from './Pagination';

describe('getPaginationRange', () => {
  it.each([
    [{ page: 1, totalPages: 10 }, [1, 2, 3, 4, 5, 'ellipsis-end', 10]],
    [{ page: 4, totalPages: 10 }, [1, 2, 3, 4, 5, 'ellipsis-end', 10]],
    [{ page: 5, totalPages: 10 }, [1, 'ellipsis-start', 4, 5, 6, 'ellipsis-end', 10]],
    [{ page: 6, totalPages: 10 }, [1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 10]],
    [{ page: 10, totalPages: 10 }, [1, 'ellipsis-start', 6, 7, 8, 9, 10]],
    [{ page: 3, totalPages: 5 }, [1, 2, 3, 4, 5]],
    [{ page: 1, totalPages: 7 }, [1, 2, 3, 4, 5, 6, 7]],
    [{ page: 1, totalPages: 1 }, [1]],
    [{ page: 1, totalPages: 2 }, [1, 2]],
    [{ page: 1, totalPages: 0 }, []],
    [{ page: 10, totalPages: 20, siblingCount: 2 }, [1, 'ellipsis-start', 8, 9, 10, 11, 12, 'ellipsis-end', 20]],
    [{ page: 10, totalPages: 20, boundaryCount: 2 }, [1, 2, 'ellipsis-start', 9, 10, 11, 'ellipsis-end', 19, 20]],
    [{ page: 10, totalPages: 20, siblingCount: 0 }, [1, 'ellipsis-start', 10, 'ellipsis-end', 20]],
    [{ page: 10, totalPages: 20, boundaryCount: 0 }, ['ellipsis-start', 9, 10, 11, 'ellipsis-end']],
  ])('%o', (options, expected) => {
    expect(getPaginationRange(options)).toEqual(expected);
  });

  it('clamps out-of-range pages', () => {
    expect(getPaginationRange({ page: 99, totalPages: 10 })).toEqual(getPaginationRange({ page: 10, totalPages: 10 }));
    expect(getPaginationRange({ page: -3, totalPages: 10 })).toEqual(getPaginationRange({ page: 1, totalPages: 10 }));
  });

  it('is always ascending, includes the current page, keeps a constant length, and never hides a single page', () => {
    for (const siblingCount of [0, 1, 2]) {
      for (const boundaryCount of [0, 1, 2]) {
        for (let totalPages = 1; totalPages <= 30; totalPages++) {
          const lengths = new Set<number>();
          for (let page = 1; page <= totalPages; page++) {
            const items = getPaginationRange({ page, totalPages, siblingCount, boundaryCount });
            lengths.add(items.length);
            expect(items).toContain(page);
            // Replace each ellipsis by the gap it hides; every gap must be >= 2 pages.
            let previous = 0;
            let pendingEllipsis = false;
            for (const item of items) {
              if (typeof item !== 'number') {
                pendingEllipsis = true;
                continue;
              }
              expect(item).toBeGreaterThan(previous);
              if (pendingEllipsis) expect(item - previous - 1).toBeGreaterThanOrEqual(2);
              else expect(item).toBe(previous + 1);
              pendingEllipsis = false;
              previous = item;
            }
            if (pendingEllipsis) expect(totalPages - previous).toBeGreaterThanOrEqual(2);
            else expect(previous).toBe(totalPages);
          }
          if (boundaryCount > 0) expect(lengths.size).toBe(1);
        }
      }
    }
  });
});

describe('Pagination', () => {
  it('renders a labelled nav, marks the current page and labels prev/next', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />);
    const nav = screen.getByRole('navigation', { name: 'Pagination' });
    expect(within(nav).getByRole('button', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('button', { name: 'Previous page' })).toBeEnabled();
    expect(within(nav).getByRole('button', { name: 'Next page' })).toBeEnabled();
    // Ellipses are hidden from assistive tech.
    expect(within(nav).getAllByRole('listitem')).toHaveLength(7);
  });

  it('calls onPageChange in button mode', async () => {
    const onPageChange = vi.fn();
    render(<Pagination page={5} totalPages={10} onPageChange={onPageChange} />);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Page 10' }));
    await userEvent.click(screen.getByRole('button', { name: 'Page 5' })); // current: no-op
    expect(onPageChange.mock.calls).toEqual([[6], [4], [10]]);
  });

  it('disables previous/next at the bounds', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('renders links with getHref, and disabled links without href', () => {
    render(<Pagination page={1} totalPages={10} getHref={(p) => `/posts?page=${p}`} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByRole('link', { name: 'Page 2' })).toHaveAttribute('href', '/posts?page=2');
    expect(screen.getByRole('link', { name: 'Page 1' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Next page' })).toHaveAttribute('href', '/posts?page=2');
    const previous = screen.getByRole('link', { name: 'Previous page' });
    expect(previous).toHaveAttribute('aria-disabled', 'true');
    expect(previous).not.toHaveAttribute('href');
  });

  it('supports localised labels and sizes', () => {
    render(
      <Pagination
        page={2}
        totalPages={3}
        size="sm"
        aria-label="Seiten"
        previousLabel="Zurück"
        nextLabel="Weiter"
        getPageLabel={(p) => `Seite ${p}`}
        onPageChange={() => {}}
      />,
    );
    const nav = screen.getByRole('navigation', { name: 'Seiten' });
    expect(nav).toHaveAttribute('data-size', 'sm');
    expect(screen.getByRole('button', { name: 'Zurück' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Seite 3' })).toBeInTheDocument();
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <>
        <Pagination page={1} totalPages={10} onPageChange={() => {}} />
        <Pagination aria-label="Pagination (links)" page={10} totalPages={10} getHref={(p) => `?page=${p}`} />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
