/**
 * Typed references to the CSS custom properties defined in `./css`.
 *
 * Values are `var(--mds-*)` strings, so they stay theme-aware when used
 * from JS (inline styles, canvas, charts). The CSS files are the source
 * of truth; `tokens.test.ts` guarantees the two never drift apart.
 */

export const PREFIX = 'mds';

export const themes = ['light', 'dark'] as const;
export type Theme = (typeof themes)[number];

export const directions = ['ltr', 'rtl'] as const;
export type Direction = (typeof directions)[number];

type TokenMap<K extends string> = Readonly<Record<K, `var(--${typeof PREFIX}-${string})`>>;

function group<const K extends string>(prefix: string, keys: readonly K[]): TokenMap<K> {
  return Object.fromEntries(
    keys.map((key) => [key, `var(--${PREFIX}-${prefix}-${key})`]),
  ) as TokenMap<K>;
}

export const color = group('color', [
  'bg',
  'bg-subtle',
  'bg-muted',
  'surface',
  'surface-raised',
  'overlay',
  'text',
  'text-muted',
  'text-subtle',
  'text-disabled',
  'text-inverse',
  'border',
  'border-strong',
  'focus-ring',
  'primary',
  'primary-hover',
  'primary-active',
  'primary-subtle',
  'primary-text',
  'on-primary',
  'danger',
  'danger-hover',
  'danger-active',
  'danger-subtle',
  'danger-text',
  'on-danger',
  'success',
  'success-subtle',
  'success-text',
  'on-success',
  'warning',
  'warning-subtle',
  'warning-text',
  'on-warning',
  'info',
  'info-subtle',
  'info-text',
  'on-info',
]);

export const space = group('space', [
  '0',
  '0-5',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '8',
  '10',
  '12',
  '16',
]);

export const fontFamily = group('font-family', ['sans', 'mono']);
export const fontSize = group('font-size', ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl']);
export const fontWeight = group('font-weight', ['regular', 'medium', 'semibold', 'bold']);
export const lineHeight = group('line-height', ['tight', 'normal', 'relaxed']);
export const radius = group('radius', ['none', 'sm', 'md', 'lg', 'xl', 'full']);
export const shadow = group('shadow', ['sm', 'md', 'lg', 'xl']);
export const duration = group('duration', ['fast', 'normal', 'slow']);
export const easing = group('easing', ['standard', 'emphasized']);
export const zIndex = group('z', ['dropdown', 'overlay', 'modal', 'toast', 'tooltip']);

export const tokens = {
  color,
  space,
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  radius,
  shadow,
  duration,
  easing,
  zIndex,
} as const;
