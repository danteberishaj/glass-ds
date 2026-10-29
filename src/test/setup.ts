import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { installPopoverPolyfill } from './popover-polyfill';

afterEach(() => cleanup());

// jsdom has no Popover API: a stand-in for DatePicker (and future popover-based components).
installPopoverPolyfill();

// jsdom has HTMLDialogElement but no show/showModal/close. Minimal stand-ins for Dialog/Drawer tests.
if (typeof HTMLDialogElement !== 'undefined') {
  const proto = HTMLDialogElement.prototype;
  proto.show ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.showModal ??= function (this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  proto.close ??= function (this: HTMLDialogElement) {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
