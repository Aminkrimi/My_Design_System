import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

const fromRoot = (path: string) => fileURLToPath(new URL(`../../../${path}`, import.meta.url));

const config: StorybookConfig = {
  framework: '@storybook/react-vite',
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(ts|tsx)',
    // Component stories live next to their components.
    '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y'],
  core: { disableTelemetry: true },
  typescript: { reactDocgen: 'react-docgen-typescript' },
  viteFinal(viteConfig) {
    // Point workspace packages at their *source* so Storybook has instant HMR
    // and never depends on a stale `dist/` build.
    viteConfig.resolve ??= {};
    viteConfig.resolve.alias = [
      ...(Array.isArray(viteConfig.resolve.alias) ? viteConfig.resolve.alias : []),
      {
        find: '@mds/tokens/tokens.css',
        replacement: fromRoot('packages/tokens/src/css/index.css'),
      },
      { find: '@mds/tokens/fonts.css', replacement: fromRoot('packages/tokens/fonts/fonts.css') },
      { find: /^@mds\/tokens$/, replacement: fromRoot('packages/tokens/src/index.ts') },
      { find: /^@mds\/ui$/, replacement: fromRoot('packages/ui/src/index.ts') },
    ];
    return viteConfig;
  },
};

export default config;
