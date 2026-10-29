import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Button } from './Button';

describe('Button', () => {
  it('defaults to type="button" so it never submits a form by accident', () => {
    render(<Button>Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'button');
  });

  it('applies the glass recipe only to the glass variant', () => {
    const { rerender } = render(<Button>Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('gds-glass');
    rerender(<Button variant="solid">Go</Button>);
    expect(screen.getByRole('button')).not.toHaveClass('gds-glass');
  });

  it('calls onClick and forwards ref', async () => {
    const onClick = vi.fn();
    const ref = createRef<HTMLButtonElement>();
    render(<Button ref={ref} onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('does not fire onClick when disabled', async () => {
    const onClick = vi.fn();
    render(<Button disabled onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Button>Go</Button>);
    await expectNoA11yViolations(container);
  });
});
