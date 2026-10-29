import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Alert } from './Alert';

describe('Alert', () => {
  it('is a polite status by default', () => {
    render(<Alert title="Saved">All changes saved.</Alert>);
    const alert = screen.getByRole('status');
    expect(alert).toHaveTextContent('SavedAll changes saved.');
    expect(alert).toHaveAttribute('data-tone', 'neutral');
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('uses role="alert" when urgent', () => {
    render(<Alert urgent tone="danger">Connection lost.</Alert>);
    expect(screen.getByRole('alert')).toHaveAttribute('data-tone', 'danger');
  });

  it('hides the icon from assistive tech and omits empty slots', () => {
    const { container } = render(<Alert icon={<svg data-testid="icon" />}>Body</Alert>);
    expect(screen.getByTestId('icon').parentElement).toHaveAttribute('aria-hidden', 'true');
    expect(container.querySelector('.title')).toBeNull();
  });

  it('merges className, forwards ref and spreads rest', () => {
    const ref = createRef<HTMLDivElement>();
    render(<Alert ref={ref} className="custom" id="a1">Body</Alert>);
    expect(ref.current).toHaveClass('custom', 'gds-glass');
    expect(ref.current).toHaveAttribute('id', 'a1');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Alert tone="success" title="Done" icon={<svg />}>Payment received.</Alert>
        <Alert tone="danger" urgent title="Failed">Try again.</Alert>
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
