import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // `legacy/` keeps the pre-migration vanilla implementation as the reference
  // the webhook payload-parity test runs against — it is not maintained code.
  { ignores: ['dist', 'legacy', 'node_modules', 'coverage'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Style rules that mirror .prettierrc.json. Indentation (2 spaces) is
      // left to Prettier/.editorconfig — the core `indent` rule fights JSX.
      quotes: ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'only-multiline'],
      semi: ['error', 'always'],
    },
  }
);
