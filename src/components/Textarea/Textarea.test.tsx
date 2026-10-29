import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import { describe, expect, it } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Textarea } from './Textarea';

describe('Textarea', () => {
  it('associates the label, defaults to 3 rows and vertical resize, forwards ref', async () => {
    const ref = createRef<HTMLTextAreaElement>();
    render(<Textarea label="Message" ref={ref} />);
    const field = screen.getByLabelText('Message');
    expect(field).toBeInstanceOf(HTMLTextAreaElement);
    expect(field).toHaveAttribute('rows', '3');
    expect(field).toHaveAttribute('data-resize', 'vertical');
    expect(field).toHaveClass('gds-glass');
    expect(ref.current).toBe(field);
    await userEvent.type(field, 'Hi');
    expect(field).toHaveValue('Hi');
  });

  it('passes rows and resize through', () => {
    render(<Textarea label="Message" rows={6} resize="none" />);
    const field = screen.getByLabelText('Message');
    expect(field).toHaveAttribute('rows', '6');
    expect(field).toHaveAttribute('data-resize', 'none');
  });

  it('links hint and error through aria-describedby and marks invalid', () => {
    render(<Textarea label="Message" hint="Be nice" error="Required" aria-describedby="external" />);
    const field = screen.getByLabelText('Message');
    expect(field).toHaveAttribute('aria-invalid', 'true');
    expect(field).toHaveAccessibleDescription('Be nice Required');
    expect(field.getAttribute('aria-describedby')).toMatch(/^external /);
  });

  it('respects a caller-provided id', () => {
    render(<Textarea label="Message" id="msg" hint="Hint" />);
    expect(screen.getByLabelText('Message')).toHaveAttribute('aria-describedby', 'msg-hint');
  });

  it('has no a11y violations', async () => {
    const { container } = render(<Textarea label="Message" hint="Hint" error="Error" />);
    await expectNoA11yViolations(container);
  });
});
