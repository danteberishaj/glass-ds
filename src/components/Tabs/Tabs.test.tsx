import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './Tabs';

function Example(props: Partial<TabsProps> & { disableSecond?: boolean }) {
  const { disableSecond, ...rest } = props;
  return (
    <Tabs defaultValue="account" {...rest}>
      <TabList aria-label="Settings">
        <Tab value="account">Account</Tab>
        <Tab value="password" disabled={disableSecond}>Password</Tab>
        <Tab value="billing">Billing</Tab>
      </TabList>
      <TabPanel value="account">Account panel</TabPanel>
      <TabPanel value="password">Password panel</TabPanel>
      <TabPanel value="billing">Billing panel</TabPanel>
    </Tabs>
  );
}

describe('Tabs', () => {
  it('wires roles, aria-selected, aria-controls and aria-labelledby', () => {
    render(<Example />);
    const tab = screen.getByRole('tab', { name: 'Account' });
    expect(screen.getByRole('tablist', { name: 'Settings' })).toBeInTheDocument();
    expect(tab).toHaveAttribute('aria-selected', 'true');
    const panel = screen.getByRole('tabpanel', { name: 'Account' });
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
    expect(panel).toHaveTextContent('Account panel');
  });

  it('keeps inactive panels mounted but hidden', () => {
    render(<Example />);
    const hidden = screen.getByText('Password panel');
    expect(hidden).toHaveAttribute('hidden');
    expect(screen.getAllByRole('tabpanel')).toHaveLength(1);
  });

  it('uses a roving tabindex', () => {
    render(<Example />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('tabindex', '-1');
  });

  it('selects on click', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(onValueChange).toHaveBeenCalledWith('billing');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing panel');
  });

  it('moves and selects with arrows (wrapping), Home and End, skipping disabled tabs', async () => {
    render(<Example disableSecond />);
    await userEvent.click(screen.getByRole('tab', { name: 'Account' }));
    await userEvent.keyboard('{ArrowRight}');
    const billing = screen.getByRole('tab', { name: 'Billing' });
    expect(billing).toHaveFocus();
    expect(billing).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();
    await userEvent.keyboard('{ArrowLeft}');
    expect(billing).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(billing).toHaveFocus();
  });

  it('uses ArrowUp/ArrowDown when vertical and ignores ArrowRight', async () => {
    render(<Example orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.click(screen.getByRole('tab', { name: 'Account' }));
    await userEvent.keyboard('{ArrowRight}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveFocus();
  });

  it('manual activation moves focus only; Enter selects', async () => {
    render(<Example activationMode="manual" />);
    await userEvent.click(screen.getByRole('tab', { name: 'Account' }));
    await userEvent.keyboard('{ArrowRight}');
    const password = screen.getByRole('tab', { name: 'Password' });
    expect(password).toHaveFocus();
    expect(password).toHaveAttribute('aria-selected', 'false');
    await userEvent.keyboard('{Enter}');
    expect(password).toHaveAttribute('aria-selected', 'true');
  });

  it('works controlled', async () => {
    function Controlled() {
      const [value, setValue] = useState('billing');
      return (
        <>
          <Example value={value} onValueChange={setValue} />
          <output>{value}</output>
        </>
      );
    }
    render(<Controlled />);
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(screen.getByRole('tab', { name: 'Password' }));
    expect(screen.getByRole('status')).toHaveTextContent('password');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('aria-selected', 'true');
  });

  it('does not call onValueChange when clicking the already-selected tab', async () => {
    const onValueChange = vi.fn();
    render(<Example onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole('tab', { name: 'Account' }));
    expect(onValueChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));
    await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(onValueChange).toHaveBeenCalledExactlyOnceWith('billing');
  });

  it('puts the first enabled tab in the tab order when value names a disabled or absent tab', () => {
    const { rerender } = render(<Example value="password" disableSecond />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Password' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('tabindex', '-1');
    rerender(<Example value="nope" />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '0');
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('tabindex', '-1');
    rerender(<Example value="billing" />);
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('tabindex', '-1');
    expect(screen.getByRole('tab', { name: 'Billing' })).toHaveAttribute('tabindex', '0');
  });

  it('a controlled value without onValueChange does not change', async () => {
    render(<Example value="account" />);
    await userEvent.click(screen.getByRole('tab', { name: 'Billing' }));
    expect(screen.getByRole('tab', { name: 'Account' })).toHaveAttribute('aria-selected', 'true');
  });

  it('applies the glass recipe only to the glass list', () => {
    const { rerender } = render(<Example />);
    expect(screen.getByRole('tablist')).toHaveClass('gds-glass');
    rerender(<Example variant="underline" />);
    expect(screen.getByRole('tablist')).not.toHaveClass('gds-glass');
  });

  it('throws a helpful error outside <Tabs>', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Tab value="x">X</Tab>)).toThrow('<Tab> must be rendered inside <Tabs>.');
    vi.restoreAllMocks();
  });

  it('renders one decorative selection indicator and flags the list once it is measured', async () => {
    render(<Example />);
    const list = screen.getByRole('tablist');
    const indicators = list.querySelectorAll(':scope > .indicator');
    expect(indicators).toHaveLength(1);
    expect(indicators[0]).toHaveAttribute('aria-hidden', 'true');
    expect(list).toHaveAttribute('data-indicator-ready');
    expect(list.style.getPropertyValue('--_indicator-w')).toMatch(/px$/);
    // The indicator is not a tab: keyboard navigation and tab queries are unaffected.
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <>
        <Example />
        <Example variant="underline" orientation="vertical" disableSecond />
      </>,
    );
    await expectNoA11yViolations(container);
  });
});
