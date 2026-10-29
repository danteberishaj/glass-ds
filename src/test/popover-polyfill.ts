/*
 * jsdom has no Popover API. Minimal stand-in: show/hide/togglePopover with beforetoggle/toggle events
 * (carrying oldState/newState) and `popovertarget` invokers. Light dismiss isn't modelled.
 * Installed for every test by src/test/setup.ts; a test can `uninstallPopoverPolyfill()` to cover the
 * no-Popover-API fallback and `installPopoverPolyfill()` again afterwards.
 */

/** Attribute set on an open popover (jsdom has no `:popover-open`). */
export const POPOVER_OPEN_ATTR = 'data-test-popover-open';

type PopoverProto = HTMLElement & Record<string, unknown>;

let uninstall: (() => void) | undefined;

export function installPopoverPolyfill(): void {
  if (uninstall || typeof HTMLElement === 'undefined') return;
  const proto = HTMLElement.prototype as PopoverProto;
  if (typeof proto.showPopover === 'function') return; // a real implementation exists
  const fire = (el: HTMLElement, type: 'beforetoggle' | 'toggle', newState: 'open' | 'closed') => {
    const event = new Event(type, { cancelable: type === 'beforetoggle' });
    Object.assign(event, { newState, oldState: newState === 'open' ? 'closed' : 'open' });
    el.dispatchEvent(event);
  };
  proto.showPopover = function showPopover(this: HTMLElement) {
    if (this.hasAttribute(POPOVER_OPEN_ATTR)) return;
    fire(this, 'beforetoggle', 'open');
    this.setAttribute(POPOVER_OPEN_ATTR, '');
    // jsdom's UA sheet hides [popover] unless :popover-open matches, which it never does here.
    this.style.setProperty('display', 'block');
    fire(this, 'toggle', 'open');
  };
  proto.hidePopover = function hidePopover(this: HTMLElement) {
    if (!this.hasAttribute(POPOVER_OPEN_ATTR)) return;
    fire(this, 'beforetoggle', 'closed');
    this.removeAttribute(POPOVER_OPEN_ATTR);
    this.style.removeProperty('display');
    fire(this, 'toggle', 'closed');
  };
  proto.togglePopover = function togglePopover(this: HTMLElement) {
    if (this.hasAttribute(POPOVER_OPEN_ATTR)) this.hidePopover();
    else this.showPopover();
    return this.hasAttribute(POPOVER_OPEN_ATTR);
  };
  const onClick = (event: MouseEvent) => {
    const invoker = (event.target as Element | null)?.closest?.('button[popovertarget]');
    if (!(invoker instanceof HTMLButtonElement) || invoker.disabled || event.defaultPrevented) return;
    document.getElementById(invoker.getAttribute('popovertarget') ?? '')?.togglePopover();
  };
  document.addEventListener('click', onClick);
  uninstall = () => {
    document.removeEventListener('click', onClick);
    const writable = proto as unknown as Record<string, unknown>;
    delete writable.showPopover;
    delete writable.hidePopover;
    delete writable.togglePopover;
  };
}

/** Removes the stand-in, so `typeof el.showPopover` is `undefined` again. No-op if not installed. */
export function uninstallPopoverPolyfill(): void {
  uninstall?.();
  uninstall = undefined;
}

export const isPopoverOpen = (el: Element) => el.hasAttribute(POPOVER_OPEN_ATTR);
