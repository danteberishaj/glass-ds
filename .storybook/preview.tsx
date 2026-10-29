import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Decorator, Preview } from '@storybook/react-vite';
import '../src/styles/index.css';
import './backdrop.css';

/**
 * Glass is invisible on a flat background, so every story renders on a vivid backdrop.
 * Set `parameters: { backdrop: 'plain' }` to check the solid-fallback look.
 */
const withBackdrop: Decorator = (Story, context) => (
  <div className="sb-backdrop" data-backdrop={context.parameters.backdrop ?? 'vivid'}>
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [
    withBackdrop,
    withThemeByDataAttribute({
      themes: { light: 'light', dark: 'dark' },
      defaultTheme: 'light',
      attributeName: 'data-theme',
    }),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { matchers: { color: /(background|color)$/i } },
    // 'error' makes axe violations fail story tests, not just show in the panel.
    a11y: { test: 'error' },
  },
  tags: ['autodocs'],
};

export default preview;
