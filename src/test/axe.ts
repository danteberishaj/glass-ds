import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Asserts no axe violations. jsdom can't compute layout or blur, so color-contrast is off here;
 * contrast is checked in Storybook's a11y panel on the real backdrop.
 */
export async function expectNoA11yViolations(container: Element) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } });
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
}
