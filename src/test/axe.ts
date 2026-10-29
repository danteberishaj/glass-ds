import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Asserts no axe violations. jsdom can't compute layout or blur, so color-contrast is off here;
 * contrast is checked in Storybook's a11y panel on the real backdrop. `region` is a page-level rule
 * (content outside landmarks) that doesn't apply to an isolated component.
 */
export async function expectNoA11yViolations(container: Element) {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  const report = results.violations
    .map((v) => `${v.id}: ${v.help}\n${v.nodes.map((n) => `  - ${n.target.join(' ')}\n    ${n.failureSummary?.replace(/\n/g, '\n    ')}`).join('\n')}`)
    .join('\n');
  expect(report, 'axe violations').toBe('');
}
