import { useLayoutEffect, type RefObject } from 'react';

/*
 * Internal positioning for floating layers (DatePicker today; Tooltip/Popover/Menu later).
 * Not exported from the package.
 *
 * Pairs with the native Popover API: a `popover="auto"` element lives in the top layer, so it
 * escapes `backdrop-filter`/`transform` containing blocks and needs no z-index. Top-layer
 * popovers are centred by the UA stylesheet (`inset: 0; margin: auto`); this hook overrides that
 * with `position: fixed; inset: auto; margin: 0; top/left` in viewport coordinates.
 */

export type AnchoredPlacement = 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';

export type AnchorRect = { top: number; left: number; right: number; bottom: number };
export type Size = { width: number; height: number };

export type ComputePositionOptions = {
  /** Gap between anchor and floating element, px. */
  offset?: number;
  /** Minimum distance from the viewport edges, px. */
  gutter?: number;
  /** Right-to-left: `start`/`end` alignment mirrors (start = the anchor's right edge). */
  rtl?: boolean;
};

export type ComputedPosition = { top: number; left: number; placement: AnchoredPlacement };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

/**
 * Pure placement math (viewport coordinates, px).
 * Flips to the other side when the preferred one is too short and the other side has more room,
 * then clamps into the viewport, keeping `gutter` px from each edge where possible.
 */
export function computePosition(
  anchor: AnchorRect,
  floating: Size,
  viewport: Size,
  placement: AnchoredPlacement = 'bottom-start',
  { offset = 8, gutter = 8, rtl = false }: ComputePositionOptions = {},
): ComputedPosition {
  const [preferredSide, align] = placement.split('-') as ['top' | 'bottom', 'start' | 'end'];
  const spaceBelow = viewport.height - anchor.bottom - offset - gutter;
  const spaceAbove = anchor.top - offset - gutter;

  let side = preferredSide;
  if (side === 'bottom' && floating.height > spaceBelow && spaceAbove > spaceBelow) side = 'top';
  else if (side === 'top' && floating.height > spaceAbove && spaceBelow > spaceAbove) side = 'bottom';

  const top = side === 'bottom' ? anchor.bottom + offset : anchor.top - offset - floating.height;
  const alignToRight = (align === 'end') !== rtl;
  const left = alignToRight ? anchor.right - floating.width : anchor.left;

  return {
    top: Math.round(clamp(top, gutter, Math.max(gutter, viewport.height - gutter - floating.height))),
    left: Math.round(clamp(left, gutter, Math.max(gutter, viewport.width - gutter - floating.width))),
    placement: `${side}-${align}`,
  };
}

export type UseAnchoredPositionOptions = ComputePositionOptions & {
  /** Position only while open. */
  open: boolean;
  placement?: AnchoredPlacement;
};

/**
 * While `open`, keeps `floatingRef` fixed next to `anchorRef`, updating (rAF-throttled) on scroll
 * in any scroller (capture), window and visual-viewport resize/scroll, and size changes of either element.
 *
 * Writes the resolved placement to the floating element's `data-placement` attribute (directly,
 * so a flip doesn't re-render the owner); style the entry animation's origin from it.
 * Don't also render `data-placement` from JSX on that element.
 */
export function useAnchoredPosition(
  anchorRef: RefObject<HTMLElement | null>,
  floatingRef: RefObject<HTMLElement | null>,
  { open, placement = 'bottom-start', offset = 8, gutter = 8, rtl }: UseAnchoredPositionOptions,
): void {
  // Layout effect: the first position is applied before paint, so it never flashes centred.
  // (React 19 doesn't warn about layout effects during SSR; they simply don't run there.)
  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    const floating = floatingRef.current;
    if (!open || !anchor || !floating) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const root = document.documentElement;
      const isRtl = rtl ?? getComputedStyle(anchor).direction === 'rtl';
      const position = computePosition(
        anchor.getBoundingClientRect(),
        // offset* sizes ignore the entry animation's scale(), unlike getBoundingClientRect().
        { width: floating.offsetWidth, height: floating.offsetHeight },
        // clientWidth/Height exclude scrollbars, so we never tuck under one.
        { width: root.clientWidth || window.innerWidth, height: root.clientHeight || window.innerHeight },
        placement,
        { offset, gutter, rtl: isRtl },
      );
      floating.style.position = 'fixed';
      floating.style.inset = 'auto';
      floating.style.margin = '0';
      floating.style.top = `${position.top}px`;
      floating.style.left = `${position.left}px`;
      floating.dataset.placement = position.placement;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    // Pinch-zoom and the on-screen keyboard move the visual viewport without a window resize/scroll.
    const visualViewport = window.visualViewport ?? null;
    visualViewport?.addEventListener('resize', schedule, { passive: true });
    visualViewport?.addEventListener('scroll', schedule, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(anchor);
    observer?.observe(floating);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule, { capture: true });
      window.removeEventListener('resize', schedule);
      visualViewport?.removeEventListener('resize', schedule);
      visualViewport?.removeEventListener('scroll', schedule);
      observer?.disconnect();
    };
  }, [open, placement, offset, gutter, rtl, anchorRef, floatingRef]);
}
