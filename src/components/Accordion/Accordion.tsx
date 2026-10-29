import type { ComponentPropsWithRef } from 'react';
import { cx } from '../../utils/cx';
import { Glass, type GlassProps } from '../Glass';
import styles from './Accordion.module.css';

/*
 * Built on native <details>/<summary>: no hooks, no context, so it renders in Server Components,
 * works before (or without) hydration, and closed content is still found by find-in-page.
 *
 * Single vs multiple: there is no `type` prop. Give every AccordionItem the same `name` and the
 * browser makes the group exclusive (only one open at a time). Passing the name down from
 * Accordion would need context (client-only) or cloneElement (breaks with wrappers/fragments).
 */

export type AccordionProps = Omit<GlassProps, 'as'>;

/** Glass container that groups AccordionItems and draws dividers between them. */
export function Accordion({ className, intensity = 'regular', radius = 'lg', ...rest }: AccordionProps) {
  return <Glass intensity={intensity} radius={radius} className={cx(styles.root, className)} {...rest} />;
}

export type AccordionItemProps = Omit<ComponentPropsWithRef<'details'>, 'open'> & {
  /**
   * Initial-and-synced, **not vetoable**: `open` is written to the native `open` attribute whenever it
   * changes, but the browser still toggles the `<details>` itself on click/Enter (and when a sibling with
   * the same `name` opens), so the element can drift from the prop until you update it. There is no way
   * to cancel a native toggle: `toggle` fires after the fact and `summary` clicks can't be prevented
   * without losing keyboard/AT behaviour. Keep the prop in sync from `onToggle`
   * (`event.currentTarget.open`), or use `defaultOpen` and let the element own it.
   */
  open?: boolean;
  /** Open on first render. The browser owns the state afterwards (listen with `onToggle`). */
  defaultOpen?: boolean;
};

/**
 * One collapsible section (`<details>`). Pass `open` and update it from `onToggle`
 * (`event.currentTarget.open`); see `open` for why it can't veto a toggle. Same `name` on several items
 * = only one open at a time.
 */
export function AccordionItem({ open, defaultOpen, className, ...rest }: AccordionItemProps) {
  return <details open={open ?? defaultOpen} className={cx(styles.item, className)} {...rest} />;
}

export type AccordionTriggerProps = ComponentPropsWithRef<'summary'>;

/** The always-visible row (`<summary>`) that toggles its item. Draws a rotating chevron. */
export function AccordionTrigger({ className, children, ...rest }: AccordionTriggerProps) {
  return (
    <summary className={cx(styles.trigger, className)} {...rest}>
      <span className={styles.label}>{children}</span>
      <span className={styles.chevron} aria-hidden="true" />
    </summary>
  );
}

export type AccordionContentProps = ComponentPropsWithRef<'div'>;

/** The collapsible panel. Must be a child of AccordionItem, after AccordionTrigger. */
export function AccordionContent({ className, ...rest }: AccordionContentProps) {
  return <div className={cx(styles.content, className)} {...rest} />;
}
