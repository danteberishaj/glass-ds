'use client';

import {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
} from 'react';
import { cx } from '../../utils/cx';
import { GLASS_CLASS } from '../../utils/glass';
import styles from './Tabs.module.css';

/*
 * WAI-ARIA tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/).
 * Client component: it needs state, context and useId. TabPanel children can still be
 * Server Components: they are passed through as already-rendered props.
 */

export type TabsVariant = 'glass' | 'underline';
export type TabsSize = 'sm' | 'md';
export type TabsOrientation = 'horizontal' | 'vertical';
export type TabsActivationMode = 'automatic' | 'manual';

type TabsContextValue = {
  baseId: string;
  value: string | undefined;
  select: (value: string) => void;
  variant: TabsVariant;
  size: TabsSize;
  orientation: TabsOrientation;
  activationMode: TabsActivationMode;
};

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabsContext(part: string) {
  const context = use(TabsContext);
  if (!context) throw new Error(`<${part}> must be rendered inside <Tabs>.`);
  return context;
}

/** Values are free text; ids can't contain whitespace (aria-controls is a space-separated list). */
const partId = (baseId: string, part: 'tab' | 'panel', value: string) =>
  `${baseId}-${part}-${value.replace(/\s+/g, '-')}`;

export type TabsProps = Omit<ComponentPropsWithRef<'div'>, 'defaultValue' | 'onChange'> & {
  /** Selected tab (controlled). */
  value?: string;
  /** Initially selected tab (uncontrolled). Set this (or `value`) so one tab is in the tab order. */
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: TabsVariant;
  size?: TabsSize;
  /** Vertical tabs use ArrowUp/ArrowDown instead of ArrowLeft/ArrowRight. */
  orientation?: TabsOrientation;
  /**
   * `automatic` (default) selects a tab as soon as it receives focus from the arrow keys.
   * `manual` moves focus only; Enter or Space selects. Use manual when panels are slow to render.
   */
  activationMode?: TabsActivationMode;
};

export function Tabs({
  value: valueProp,
  defaultValue,
  onValueChange,
  variant = 'glass',
  size = 'md',
  orientation = 'horizontal',
  activationMode = 'automatic',
  className,
  ...rest
}: TabsProps) {
  const baseId = useId();
  const [uncontrolled, setUncontrolled] = useState(defaultValue);
  const isControlled = valueProp !== undefined;
  const value = isControlled ? valueProp : uncontrolled;

  // Re-selecting the current tab is a no-op: no state write, no onValueChange.
  const select = useCallback(
    (next: string) => {
      if (next === value) return;
      if (!isControlled) setUncontrolled(next);
      onValueChange?.(next);
    },
    [value, isControlled, onValueChange],
  );

  const context = useMemo<TabsContextValue>(
    () => ({ baseId, value, select, variant, size, orientation, activationMode }),
    [baseId, value, select, variant, size, orientation, activationMode],
  );

  return (
    <TabsContext value={context}>
      <div data-orientation={orientation} className={cx(styles.root, className)} {...rest} />
    </TabsContext>
  );
}

export type TabListProps = ComponentPropsWithRef<'div'>;

/** The list's own tabs, not those of a nested <Tabs>. */
function ownTabs(list: HTMLElement) {
  return Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]')).filter(
    (tab) => tab.closest('[role="tablist"]') === list,
  );
}

/**
 * Moves the shared selection indicator under the selected tab: writes its geometry as custom
 * properties on the list and flags the list `data-indicator-ready`. Until then (SSR, no JS, nothing
 * selected) the selected tab draws its own pill/underline, so first paint is right and nothing shifts.
 */
function syncIndicator(list: HTMLElement) {
  const tab = ownTabs(list).find((t) => t.getAttribute('aria-selected') === 'true');
  if (!tab) {
    list.removeAttribute('data-indicator-ready');
    return;
  }
  // offset* ignore transforms and are relative to the list (the tabs' offsetParent: position: relative).
  list.style.setProperty('--_indicator-x', `${tab.offsetLeft}px`);
  list.style.setProperty('--_indicator-y', `${tab.offsetTop}px`);
  list.style.setProperty('--_indicator-w', `${tab.offsetWidth}px`);
  list.style.setProperty('--_indicator-h', `${tab.offsetHeight}px`);
  // The indicator is display:none until ready, so its first frame starts in place (no slide-in from 0,0).
  list.setAttribute('data-indicator-ready', '');
}

/**
 * Roving tabindex fallback: when `value` names a disabled or absent tab, no tab would be in the tab
 * order, so the first enabled tab takes tabIndex 0. Mirrors what Tab renders in the normal case
 * (selected = 0, others = -1), so React's later attribute updates and this agree.
 */
function syncTabbable(list: HTMLElement, value: string | undefined) {
  if (value === undefined) return; // nothing selected: every tab stays reachable (Tab renders 0)
  const tabs = ownTabs(list);
  const target =
    tabs.find((tab) => tab.getAttribute('aria-selected') === 'true' && !tab.disabled) ?? tabs.find((tab) => !tab.disabled);
  for (const tab of tabs) tab.tabIndex = tab === target ? 0 : -1;
}

export function TabList({ className, onKeyDown, children, ...rest }: TabListProps) {
  const { value, variant, size, orientation, activationMode, select } = useTabsContext('TabList');
  // Our own ref on the indicator (the caller owns the list's `ref`; we don't merge refs, see GOTCHA).
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  // One observer per mount: re-measures whenever the list or a tab resizes (fonts, wrapping).
  useLayoutEffect(() => {
    const list = indicatorRef.current?.parentElement;
    if (!list || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => syncIndicator(list));
    observer.observe(list);
    observerRef.current = observer;
    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, []);

  // Re-sync on selection/appearance changes (not on every render), and observe tabs added since
  // (observing an element twice is a no-op).
  useLayoutEffect(() => {
    const list = indicatorRef.current?.parentElement;
    if (!list) return;
    syncTabbable(list, value);
    syncIndicator(list);
    const observer = observerRef.current;
    if (observer) for (const tab of ownTabs(list)) observer.observe(tab);
  }, [value, variant, size, orientation]);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented) return;

    const list = event.currentTarget;
    // Only this list's own enabled tabs, not those of a nested <Tabs>.
    const tabs = ownTabs(list).filter((tab) => !tab.disabled);
    const current = tabs.indexOf(event.target as HTMLButtonElement);
    if (current === -1 || tabs.length === 0) return;

    const rtl = orientation === 'horizontal' && getComputedStyle(list).direction === 'rtl';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : rtl ? 'ArrowRight' : 'ArrowLeft';
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : rtl ? 'ArrowLeft' : 'ArrowRight';

    let target: number;
    if (event.key === nextKey) target = (current + 1) % tabs.length;
    else if (event.key === prevKey) target = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = tabs.length - 1;
    else return;

    event.preventDefault();
    const tab = tabs[target];
    if (!tab) return;
    tab.focus();
    const value = tab.dataset.value;
    if (activationMode === 'automatic' && value !== undefined) select(value);
  }

  return (
    <div
      role="tablist"
      aria-orientation={orientation === 'vertical' ? 'vertical' : undefined}
      data-variant={variant}
      data-size={size}
      data-orientation={orientation}
      className={cx(variant === 'glass' && GLASS_CLASS, styles.list, className)}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {/* First child so the tabs paint above it. Decorative: selection is exposed by aria-selected. */}
      <span ref={indicatorRef} className={styles.indicator} aria-hidden="true" />
      {children}
    </div>
  );
}

export type TabProps = Omit<ComponentPropsWithRef<'button'>, 'value'> & {
  /** Identifies the tab and its TabPanel. */
  value: string;
};

export function Tab({ value, className, onClick, disabled, type = 'button', ...rest }: TabProps) {
  const context = useTabsContext('Tab');
  const selected = context.value === value;
  // Roving tabindex: only the selected tab is in the tab order. With nothing selected, keep all reachable.
  const tabIndex = selected || context.value === undefined ? 0 : -1;

  return (
    <button
      type={type}
      role="tab"
      id={partId(context.baseId, 'tab', value)}
      aria-controls={partId(context.baseId, 'panel', value)}
      aria-selected={selected}
      tabIndex={tabIndex}
      disabled={disabled}
      data-value={value}
      data-state={selected ? 'active' : 'inactive'}
      data-variant={context.variant}
      data-size={context.size}
      data-orientation={context.orientation}
      className={cx(styles.tab, className)}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.select(value);
      }}
      {...rest}
    />
  );
}

export type TabPanelProps = ComponentPropsWithRef<'div'> & {
  /** The Tab this panel belongs to. */
  value: string;
};

/** Inactive panels stay mounted with `hidden`, so SSR output contains every panel. */
export function TabPanel({ value, className, ...rest }: TabPanelProps) {
  const context = useTabsContext('TabPanel');
  const selected = context.value === value;

  return (
    <div
      role="tabpanel"
      id={partId(context.baseId, 'panel', value)}
      aria-labelledby={partId(context.baseId, 'tab', value)}
      hidden={!selected}
      tabIndex={0}
      data-state={selected ? 'active' : 'inactive'}
      data-orientation={context.orientation}
      className={cx(styles.panel, className)}
      {...rest}
    />
  );
}
