import type { Decorator, Preview } from '@storybook/react-vite';
import type { Direction, Theme } from '@mds/tokens';
import '@mds/tokens/fonts.css';
import '@mds/tokens/tokens.css';
import './preview.css';

/**
 * Applies the toolbar's theme + direction to <html>, exactly the way a
 * consuming app would. Portaled content (Modal, Toast, Select) lives outside
 * the story root, so setting it on the document is the only correct option.
 */
const withThemeAndDirection: Decorator = (Story, context) => {
  const theme = (context.globals['theme'] as Theme | undefined) ?? 'light';
  const dir = (context.globals['dir'] as Direction | undefined) ?? 'ltr';
  const root = document.documentElement;
  root.setAttribute('data-theme', theme);
  root.setAttribute('dir', dir);
  root.setAttribute('lang', dir === 'rtl' ? 'fa' : 'en');
  return <Story />;
};

const preview: Preview = {
  decorators: [withThemeAndDirection],
  globalTypes: {
    theme: {
      description: 'Color theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
    dir: {
      description: 'Text direction',
      toolbar: {
        title: 'Direction',
        icon: 'transfer',
        items: [
          { value: 'ltr', title: 'LTR (English)', right: '→' },
          { value: 'rtl', title: 'RTL (فارسی)', right: '←' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
    dir: 'ltr',
  },
  parameters: {
    layout: 'padded',
    // Our tokens own the canvas background; Storybook's picker would fight them.
    backgrounds: { disable: true },
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i },
    },
    a11y: {
      // Fail the a11y panel (and future test runs) on any violation.
      test: 'error',
    },
  },
};

export default preview;
