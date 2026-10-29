import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './Accordion';

function Faq({ name, defaultOpen }: { name?: string; defaultOpen?: boolean }) {
  return (
    <Accordion data-testid="root">
      <AccordionItem name={name} defaultOpen={defaultOpen}>
        <AccordionTrigger>One</AccordionTrigger>
        <AccordionContent>First panel</AccordionContent>
      </AccordionItem>
      <AccordionItem name={name}>
        <AccordionTrigger>Two</AccordionTrigger>
        <AccordionContent>Second panel</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const details = (label: string) => screen.getByText(label).closest('details') as HTMLDetailsElement;

describe('Accordion', () => {
  it('renders native details/summary inside a glass container', () => {
    render(<Faq />);
    expect(screen.getByTestId('root')).toHaveClass('gds-glass');
    expect(details('One').querySelector(':scope > summary')).toHaveTextContent('One');
  });

  it('toggles an item when its trigger is clicked', async () => {
    render(<Faq />);
    expect(details('One').open).toBe(false);
    await userEvent.click(screen.getByText('One'));
    expect(details('One').open).toBe(true);
    await userEvent.click(screen.getByText('One'));
    expect(details('One').open).toBe(false);
  });

  it('opens with defaultOpen', () => {
    render(<Faq defaultOpen />);
    expect(details('One').open).toBe(true);
    expect(details('Two').open).toBe(false);
  });

  it('passes `name` through for native exclusive (single) mode', () => {
    render(<Faq name="faq" />);
    expect(details('One')).toHaveAttribute('name', 'faq');
    expect(details('Two')).toHaveAttribute('name', 'faq');
  });

  it('forwards refs and merges className', () => {
    const ref = createRef<HTMLDetailsElement>();
    render(
      <Accordion>
        <AccordionItem ref={ref} className="custom">
          <AccordionTrigger>One</AccordionTrigger>
          <AccordionContent>Panel</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDetailsElement);
    expect(ref.current).toHaveClass('custom', 'item');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Faq defaultOpen />);
    await expectNoA11yViolations(container);
  });
});
