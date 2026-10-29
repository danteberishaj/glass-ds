import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript' },
  // The library build config (lib mode, externals) must not leak into the Storybook app build.
  viteFinal: (viteConfig) => {
    // Keep plugins and CSS module naming; drop every library-build option.
    return { ...viteConfig, build: {} };
  },
};

export default config;
