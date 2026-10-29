/**
 * Renders every story under jsdom and runs axe on it, so a story that throws or has an accessibility
 * violation fails `npm test` without opening Storybook. Play functions need a real browser (jsdom lacks
 * the Popover API, exclusive <details>, range stepping, container queries…): run them in Storybook
 * itself, where the a11y addon also checks contrast on the real backdrop.
 */
import { composeStories, setProjectAnnotations } from '@storybook/react-vite';
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, it } from 'vitest';
import previewAnnotations from '../../.storybook/preview';
import { expectNoA11yViolations } from './axe';

setProjectAnnotations([previewAnnotations]);

const modules = import.meta.glob<Record<string, unknown>>('../**/*.stories.tsx', { eager: true });

afterEach(() => cleanup());

for (const [path, mod] of Object.entries(modules)) {
  const title = (mod.default as { title?: string } | undefined)?.title ?? path;
  const stories = composeStories(mod as never) as Record<string, React.ComponentType>;

  describe(title, () => {
    for (const [name, Story] of Object.entries(stories)) {
      it(name, async () => {
        const { container } = render(<Story />);
        await expectNoA11yViolations(container);
      });
    }
  });
}
