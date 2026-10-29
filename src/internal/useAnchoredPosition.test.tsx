import { act, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { computePosition, useAnchoredPosition, type AnchoredPlacement } from './useAnchoredPosition';

const viewport = { width: 1000, height: 800 };
const floating = { width: 300, height: 200 };
const rect = (top: number, left: number, width = 120, height = 40) => ({
  top,
  left,
  right: left + width,
  bottom: top + height,
});

describe('computePosition', () => {
  it('places bottom-start under the anchor, offset by the gap', () => {
    expect(computePosition(rect(100, 200), floating, viewport)).toEqual({ top: 148, left: 200, placement: 'bottom-start' });
  });

  it('aligns end placements to the anchor’s right edge', () => {
    expect(computePosition(rect(100, 600), floating, viewport, 'bottom-end')).toEqual({
      top: 148,
      left: 420,
      placement: 'bottom-end',
    });
  });

  it('places top placements above the anchor', () => {
    expect(computePosition(rect(500, 200), floating, viewport, 'top-start')).toEqual({ top: 292, left: 200, placement: 'top-start' });
    expect(computePosition(rect(500, 600), floating, viewport, 'top-end').left).toBe(420);
  });

  it('flips to the top when there isn’t room below and there is more above', () => {
    expect(computePosition(rect(700, 200), floating, viewport)).toEqual({ top: 492, left: 200, placement: 'top-start' });
    expect(computePosition(rect(700, 600), floating, viewport, 'bottom-end').placement).toBe('top-end');
  });

  it('flips to the bottom when a top placement has no room', () => {
    expect(computePosition(rect(50, 200), floating, viewport, 'top-start')).toEqual({ top: 98, left: 200, placement: 'bottom-start' });
  });

  it('stays put when neither side fits but the preferred side is larger, then clamps', () => {
    const tall = { width: 300, height: 700 };
    const result = computePosition(rect(300, 200), tall, viewport); // 452 below vs 284 above
    expect(result.placement).toBe('bottom-start');
    expect(result.top).toBe(800 - 8 - 700); // clamped into the viewport
  });

  it('clamps horizontally with the gutter', () => {
    expect(computePosition(rect(100, 900), floating, viewport).left).toBe(1000 - 8 - 300);
    expect(computePosition(rect(100, -50), floating, viewport, 'bottom-start').left).toBe(8);
    expect(computePosition(rect(100, 20, 40), floating, viewport, 'bottom-end').left).toBe(8);
  });

  it('pins to the gutter when the floating element is wider or taller than the viewport', () => {
    const huge = { width: 2000, height: 2000 };
    expect(computePosition(rect(100, 300), huge, viewport)).toMatchObject({ top: 8, left: 8 });
  });

  it('mirrors start/end in RTL', () => {
    expect(computePosition(rect(100, 600), floating, viewport, 'bottom-start', { rtl: true }).left).toBe(420);
    expect(computePosition(rect(100, 600), floating, viewport, 'bottom-end', { rtl: true }).left).toBe(600);
  });

  it('honours custom offset and gutter', () => {
    expect(computePosition(rect(100, 200), floating, viewport, 'bottom-start', { offset: 0 }).top).toBe(140);
    expect(computePosition(rect(100, 990), floating, viewport, 'bottom-start', { gutter: 16 }).left).toBe(1000 - 16 - 300);
  });

  it('rounds to whole pixels', () => {
    expect(computePosition(rect(100.4, 200.6), floating, viewport)).toMatchObject({ top: 148, left: 201 });
  });
});

function Harness({ open, placement }: { open: boolean; placement?: AnchoredPlacement }) {
  const anchorRef = useRef<HTMLButtonElement>(null);
  const floatingRef = useRef<HTMLDivElement>(null);
  useAnchoredPosition(anchorRef, floatingRef, { open, placement });
  return (
    <>
      <button ref={anchorRef}>Anchor</button>
      <div ref={floatingRef} data-testid="floating" />
    </>
  );
}

describe('useAnchoredPosition', () => {
  afterEach(() => vi.restoreAllMocks());

  it('applies fixed coordinates and the resolved placement while open, and updates on scroll', async () => {
    let anchorTop = 100;
    vi.spyOn(HTMLButtonElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ ...rect(anchorTop, 50), x: 50, y: anchorTop, width: 120, height: 40, toJSON() {} }) as DOMRect,
    );
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(300);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(200);
    vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(1000);
    vi.spyOn(document.documentElement, 'clientHeight', 'get').mockReturnValue(800);

    const { getByTestId, rerender } = render(<Harness open={false} />);
    const el = getByTestId('floating');
    expect(el.style.top).toBe('');

    rerender(<Harness open />);
    expect(el.style.position).toBe('fixed');
    expect(el.style.margin).toBe('0px');
    expect(el.style.top).toBe('148px');
    expect(el.style.left).toBe('50px');
    expect(el.dataset.placement).toBe('bottom-start');

    anchorTop = 700;
    await act(async () => {
      window.dispatchEvent(new Event('scroll'));
      await new Promise((r) => requestAnimationFrame(r));
    });
    expect(el.dataset.placement).toBe('top-start');
    expect(el.style.top).toBe('492px');
  });

  it('removes its listeners when closed', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    const { rerender } = render(<Harness open />);
    rerender(<Harness open={false} />);
    expect(remove).toHaveBeenCalledWith('scroll', expect.any(Function), { capture: true });
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});
