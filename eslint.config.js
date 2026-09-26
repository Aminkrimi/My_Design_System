import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import storybook from 'eslint-plugin-storybook';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// Physical CSS-in-JS properties are banned in favour of logical ones (RTL support).
const physicalStyleProps = [
  'marginLeft',
  'marginRight',
  'paddingLeft',
  'paddingRight',
  'left',
  'right',
  'borderLeft',
  'borderRight',
];

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/storybook-static/**', '**/coverage/**', '**/.turbo/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
  {
    files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
    plugins: {
      react,
      'react-hooks': reactHooks,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: '19.0' } },
    rules: {
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      ...jsxA11y.configs.strict.rules,
      '@typescript-eslint/consistent-type-imports': 'error',
      'no-restricted-syntax': [
        'error',
        ...physicalStyleProps.map((name) => ({
          selector: `JSXAttribute[name.name='style'] Property[key.name='${name}']`,
          message: `Use logical properties instead of "${name}" (e.g. marginInlineStart).`,
        })),
      ],
    },
  },
  ...storybook.configs['flat/recommended'],
  prettier,
);
