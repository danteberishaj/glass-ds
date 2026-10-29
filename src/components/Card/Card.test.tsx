import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

describe('Card', () => {
  it('is a glass surface with the card radius', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Card ref={ref} className="mine">Body</Card>);
    expect(ref.current).toHaveClass('gds-glass', 'mine');
    expect(ref.current).toHaveAttribute('data-radius', 'xl');
    expect(ref.current).not.toHaveAttribute('data-interactive');
  });

  it('interactive: sets data-interactive and the sheen class', () => {
    const { container } = render(<Card interactive>Body</Card>);
    const card = container.firstElementChild!;
    expect(card).toHaveAttribute('data-interactive');
    expect(card).toHaveClass('gds-sheen');
  });

  it('renders as another element with its own props', () => {
    render(
      <Card as="a" href="#pricing">
        Pro plan
      </Card>,
    );
    expect(screen.getByRole('link', { name: 'Pro plan' })).toHaveAttribute('href', '#pricing');
  });

  it('CardTitle takes a heading level through `as`', () => {
    const { rerender } = render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Title');
    rerender(<CardTitle as="h2">Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Title');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <Card interactive>
        <CardHeader>
          <CardTitle as="h2">Upgrade</CardTitle>
          <CardDescription>More of everything.</CardDescription>
        </CardHeader>
        <CardContent>Billed yearly.</CardContent>
        <CardFooter>
          <a href="#upgrade">Upgrade</a>
        </CardFooter>
      </Card>,
    );
    await expectNoA11yViolations(container);
  });
});
