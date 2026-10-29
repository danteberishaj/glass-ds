import { fireEvent, render, screen } from '@testing-library/react';
import { createRef, useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { expectNoA11yViolations } from '../../test/axe';
import { Slider } from './Slider';

const progressOf = (el: HTMLElement) => el.style.getPropertyValue('--_progress');

describe('Slider', () => {
  it('is a native range input with label, min/max/step and ref', () => {
    const ref = createRef<HTMLInputElement>();
    render(<Slider label="Volume" min={10} max={20} step={2} ref={ref} />);
    const slider = screen.getByRole('slider', { name: 'Volume' });
    expect(slider).toHaveAttribute('type', 'range');
    expect(slider).toHaveAttribute('min', '10');
    expect(slider).toHaveAttribute('max', '20');
    expect(slider).toHaveAttribute('step', '2');
    expect(ref.current).toBe(slider);
  });

  it('defaults to the midpoint and exposes progress', () => {
    render(<Slider label="Volume" />);
    const slider = screen.getByRole('slider');
    expect(slider).toHaveValue('50');
    expect(progressOf(slider)).toBe('0.5');
  });

  it('updates the fill when uncontrolled and reports the number', () => {
    const onValueChange = vi.fn();
    render(<Slider label="Volume" defaultValue={20} onValueChange={onValueChange} showValue />);
    const slider = screen.getByRole('slider');
    expect(progressOf(slider)).toBe('0.2');
    fireEvent.change(slider, { target: { value: '75' } });
    expect(progressOf(slider)).toBe('0.75');
    expect(onValueChange).toHaveBeenCalledWith(75, expect.anything());
    expect(document.querySelector('output')).toHaveTextContent('75');
  });

  // jsdom does not implement range keyboard stepping; real browsers do (see the Default story's play test).
  it('follows value when controlled', () => {
    function Controlled() {
      const [value, setValue] = useState(10);
      return <Slider label="Volume" value={value} onValueChange={setValue} />;
    }
    render(<Controlled />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '11' } });
    expect(slider).toHaveValue('11');
    expect(progressOf(slider)).toBe('0.11');
  });

  it('formats the visible value and aria-valuetext', () => {
    render(<Slider label="Opacity" min={0} max={1} step={0.1} defaultValue={0.5} showValue formatValue={(v) => `${v * 100}%`} />);
    expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '50%');
    expect(document.querySelector('output')).toHaveTextContent('50%');
  });

  it('resets the fill with its form', () => {
    render(
      <form data-testid="form">
        <Slider label="Volume" defaultValue={30} name="volume" />
      </form>,
    );
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '90' } });
    expect(progressOf(slider)).toBe('0.9');
    fireEvent.reset(screen.getByTestId('form'));
    expect(progressOf(slider)).toBe('0.3');
  });

  it('links the hint', () => {
    render(<Slider label="Volume" hint="Loud" />);
    expect(screen.getByRole('slider')).toHaveAccessibleDescription('Loud');
  });

  it('has no a11y violations', async () => {
    const { container } = render(
      <div>
        <Slider label="Volume" hint="Hint" showValue />
        <Slider label="Balance" disabled />
      </div>,
    );
    await expectNoA11yViolations(container);
  });
});
