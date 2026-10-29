import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from './Table';

type Invoice = { id: string; customer: string; email: string; status: 'Paid' | 'Pending' | 'Overdue'; method: string; date: string; amount: number };

const invoices: Invoice[] = [
  { id: 'INV-1042', customer: 'Northwind Traders', email: 'billing@northwind.example', status: 'Paid', method: 'Card', date: '2026-10-02', amount: 1250 },
  { id: 'INV-1043', customer: 'Contoso Ltd', email: 'ap@contoso.example', status: 'Pending', method: 'Bank transfer', date: '2026-10-05', amount: 860.5 },
  { id: 'INV-1044', customer: 'Fabrikam Inc', email: 'finance@fabrikam.example', status: 'Overdue', method: 'Invoice', date: '2026-09-18', amount: 4320 },
  { id: 'INV-1045', customer: 'Tailspin Toys', email: 'accounts@tailspin.example', status: 'Paid', method: 'Card', date: '2026-10-09', amount: 299.99 },
  { id: 'INV-1046', customer: 'Wide World Importers', email: 'pay@wwi.example', status: 'Paid', method: 'PayPal', date: '2026-10-11', amount: 1780 },
  { id: 'INV-1047', customer: 'Adventure Works', email: 'billing@adventure.example', status: 'Pending', method: 'Bank transfer', date: '2026-10-14', amount: 640 },
  { id: 'INV-1048', customer: 'Litware', email: 'ap@litware.example', status: 'Paid', method: 'Card', date: '2026-10-17', amount: 92.4 },
  { id: 'INV-1049', customer: 'Proseware', email: 'finance@proseware.example', status: 'Overdue', method: 'Invoice', date: '2026-09-28', amount: 2105 },
];

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const statusColor = { Paid: 'var(--gds-success)', Pending: 'var(--gds-warning)', Overdue: 'var(--gds-danger-text)' } as const;

const meta = {
  title: 'Components/Table',
  component: Table,
  subcomponents: { TableCaption, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell },
  args: { striped: false, hoverable: true, density: 'comfortable', stickyHeader: false, style: { minWidth: 720 } },
  argTypes: { density: { control: 'inline-radio', options: ['compact', 'comfortable'] } },
  decorators: [(Story) => <div style={{ width: 'min(860px, 100%)' }}><Story /></div>],
  render: (args) => (
    <Table {...args}>
      <TableCaption>Invoices issued in the last 30 days.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Date</TableHead>
          <TableHead align="end">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableHead scope="row" style={{ fontFamily: 'var(--gds-font-family-mono)' }}>{inv.id}</TableHead>
            <TableCell>
              <div style={{ fontWeight: 'var(--gds-font-weight-medium)' }}>{inv.customer}</div>
              <div style={{ color: 'var(--gds-text-secondary)', fontSize: 'var(--gds-font-size-xs)' }}>{inv.email}</div>
            </TableCell>
            <TableCell>
              <span style={{ color: statusColor[inv.status], fontWeight: 'var(--gds-font-weight-semibold)' }}>{inv.status}</span>
            </TableCell>
            <TableCell>{inv.method}</TableCell>
            <TableCell>
              <time dateTime={inv.date}>{inv.date}</time>
            </TableCell>
            <TableCell align="end">{currency.format(inv.amount)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={5}>Total</TableCell>
          <TableCell align="end">{currency.format(invoices.reduce((sum, inv) => sum + inv.amount, 0))}</TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  ),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Striped: Story = { args: { striped: true } };
export const Compact: Story = { args: { density: 'compact' } };

export const SelectedRow: Story = {
  render: (args) => (
    <Table {...args} aria-label="Team members">
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>Ada Lovelace</TableCell>
          <TableCell>Owner</TableCell>
        </TableRow>
        <TableRow data-state="selected">
          <TableCell>Grace Hopper</TableCell>
          <TableCell>Admin</TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Alan Turing</TableCell>
          <TableCell>Member</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
};

/** The container scrolls; give it a height. `tabIndex`, `role` and a label make the scroll area keyboard accessible. */
export const StickyHeader: Story = {
  args: {
    stickyHeader: true,
    striped: true,
    containerProps: { style: { maxHeight: 320 }, tabIndex: 0, role: 'region', 'aria-label': 'Invoices (scrollable)' },
  },
};

export const HorizontalScroll: Story = {
  args: {
    style: { minWidth: 1100 },
    containerProps: { tabIndex: 0, role: 'region', 'aria-label': 'Invoices (scrollable)' },
  },
  decorators: [(Story) => <div style={{ width: 480 }}><Story /></div>],
};

export const OnPlainBackground: Story = { args: { striped: true }, parameters: { backdrop: 'plain' } };
