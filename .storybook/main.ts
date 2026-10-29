import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  typescript: { reactDocgen: 'react-docgen-typescript' },
  // The library build config (lib mode, externals) must not leak into the Storybook app build.
  viteFinal: (viteConfig) => {
    if (viteConfig.build) {
      delete viteConfig.build.lib;
      delete viteConfig.build.rollupOptions;
    }
    return viteConfig;
  },
};

export default config;
