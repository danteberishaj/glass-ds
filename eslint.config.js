import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'storybook-static', 'examples', 'node_modules'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: { globals: { ...globals.browser } },
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // Library code must not import from the package's own entry or reach into dist.
      'no-restricted-imports': ['error', { patterns: ['glass-ds', 'glass-ds/*', '**/dist/*'] }],
    },
  },
  {
    files: ['scripts/**', '*.config.{ts,js}', '.storybook/**'],
    languageOptions: { globals: { ...globals.node } },
  },
  ...storybook.configs['flat/recommended'],
);
