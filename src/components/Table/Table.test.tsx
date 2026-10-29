import { render, screen, within } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
  type TableProps,
} from './Table';

function Example(props: TableProps) {
  return (
    <Table {...props}>
      <TableCaption>Invoices, last 30 days</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableHead scope="row">INV-001</TableHead>
          <TableCell>Paid</TableCell>
          <TableCell align="end">$250.00</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableHead scope="row">INV-002</TableHead>
          <TableCell>Pending</TableCell>
          <TableCell align="end">$150.00</TableCell>
        </TableRow>
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={2}>Total</TableCell>
          <TableCell align="end">$400.00</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  );
}

describe('Table', () => {
  it('renders a real table inside a glass container', () => {
    const { container } = render(<Example />);
    const table = screen.getByRole('table', { name: 'Invoices, last 30 days' });
    expect(table.parentElement).toHaveClass('gds-glass');
    expect(container.querySelectorAll('thead, tbody, tfoot')).toHaveLength(3);
  });

  it('defaults column headers to scope="col" and allows row headers', () => {
    render(<Example />);
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
    headers.forEach((th) => expect(th).toHaveAttribute('scope', 'col'));
    expect(screen.getAllByRole('rowheader')).toHaveLength(2);
    expect(screen.getByRole('columnheader', { name: 'Amount' })).toHaveAttribute('data-align', 'end');
  });

  it('exposes options as data attributes, with sensible defaults', () => {
    const { rerender } = render(<Example />);
    const table = screen.getByRole('table');
    expect(table).toHaveAttribute('data-density', 'comfortable');
    expect(table).not.toHaveAttribute('data-striped');
    rerender(<Example striped hoverable stickyHeader density="compact" />);
    expect(table).toHaveAttribute('data-density', 'compact');
    expect(table).toHaveAttribute('data-striped');
    expect(table).toHaveAttribute('data-hoverable');
    expect(table).toHaveAttribute('data-sticky-header');
  });

  it('sends ref/className/aria-label to the table and containerProps to the wrapper', () => {
    const ref = createRef<HTMLTableElement>();
    render(
      <Table ref={ref} aria-label="People" className="mine" containerProps={{ className: 'wrap', tabIndex: 0 }}>
        <TableBody>
          <TableRow>
            <TableCell>Ada</TableCell>
          </TableRow>
        </TableBody>
      </Table>,
    );
    const table = screen.getByRole('table', { name: 'People' });
    expect(ref.current).toBe(table);
    expect(table).toHaveClass('mine');
    expect(table.parentElement).toHaveClass('wrap', 'gds-glass');
    expect(table.parentElement).toHaveAttribute('tabindex', '0');
    expect(within(table).getByRole('cell')).toHaveTextContent('Ada');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Example striped hoverable stickyHeader />);
    await expectNoA11yViolations(container);
  });
});
