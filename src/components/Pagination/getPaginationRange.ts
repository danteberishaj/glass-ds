export type PaginationItem = number | 'ellipsis-start' | 'ellipsis-end';

export type PaginationRangeOptions = {
  /** Current page, 1-based. Clamped to `1..totalPages`. */
  page: number;
  totalPages: number;
  /** Pages shown on each side of the current page. Default 1. */
  siblingCount?: number;
  /** Pages always shown at the start and end. Default 1. */
  boundaryCount?: number;
};

const range = (start: number, end: number) =>
  end < start ? [] : Array.from({ length: end - start + 1 }, (_, i) => start + i);

/**
 * Pure helper: which page numbers and ellipses to show.
 *
 * The number of items stays constant once there are enough pages, so the control doesn't
 * change width while paging. An ellipsis only replaces two or more pages; a single hidden
 * page is shown instead.
 *
 * getPaginationRange({ page: 6, totalPages: 10 }) → [1, 'ellipsis-start', 5, 6, 7, 'ellipsis-end', 10]
 */
export function getPaginationRange({
  page,
  totalPages,
  siblingCount = 1,
  boundaryCount = 1,
}: PaginationRangeOptions): PaginationItem[] {
  const count = Math.max(0, Math.floor(totalPages));
  if (count === 0) return [];
  const siblings = Math.max(0, Math.floor(siblingCount));
  const boundary = Math.max(0, Math.floor(boundaryCount));
  const current = Math.min(Math.max(1, Math.floor(page)), count);

  const startPages = range(1, Math.min(boundary, count));
  const endPages = range(Math.max(count - boundary + 1, boundary + 1), count);

  const siblingsStart = Math.max(
    Math.min(current - siblings, count - boundary - siblings * 2 - 1),
    boundary + 2,
  );
  const siblingsEnd = Math.min(
    Math.max(current + siblings, boundary + siblings * 2 + 2),
    endPages.length > 0 ? endPages[0]! - 2 : count - 1,
  );

  const items: PaginationItem[] = [...startPages];

  if (siblingsStart > boundary + 2) items.push('ellipsis-start');
  else if (boundary + 1 < count - boundary) items.push(boundary + 1);

  items.push(...range(siblingsStart, siblingsEnd));

  if (siblingsEnd < count - boundary - 1) items.push('ellipsis-end');
  else if (count - boundary > boundary) items.push(count - boundary);

  items.push(...endPages);

  // Small totals can produce duplicates or out-of-range filler; normalise.
  const seen = new Set<PaginationItem>();
  return items.filter((item) => {
    if (typeof item === 'number' && (item < 1 || item > count)) return false;
    if (seen.has(item)) return false;
    seen.add(item);
    return true;
  });
}
