# ADR 0001 — Design-token architecture & styling approach

- **Status:** Accepted
- **Date:** 2026-09-26
- **Deciders:** Amin Karimi

## Context

The library must:

1. Support **light and dark themes**, switchable at runtime and scoped to any subtree.
2. Be **RTL-first**: Persian/Arabic layouts must be correct without per-component overrides.
3. Not force a styling framework (Tailwind, Emotion, styled-components…) on consumers.
4. Work in any React setup, including SSR/RSC, with **zero runtime styling cost**.
5. Stay small enough for one person to maintain.

## Decision

### 1. Tokens are CSS custom properties, in two tiers

| Tier          | Example                                 | Who may use it                |
| ------------- | --------------------------------------- | ----------------------------- |
| **Primitive** | `--mds-blue-600`, `--mds-space-4`       | Only the semantic tier        |
| **Semantic**  | `--mds-color-primary`, `--mds-color-bg` | Components and consuming apps |

- Primitives are raw values (color scales, a 4px spacing grid, type scale, radius, motion, z-index).
- Semantic tokens describe **purpose** (`color-text-muted`, `color-danger-subtle`, `shadow-md`).
  Components read **only** this tier.
- Every name is prefixed with `--mds-` to avoid collisions with host apps.

A component tier (`--mds-button-bg`) is deliberately **not** introduced yet. It will be added
per component only when a real customisation need appears (YAGNI).

### 2. Themes remap semantic tokens via `data-theme`

```css
:root, [data-theme='light'] { --mds-color-bg: var(--mds-white); … }
[data-theme='dark']         { --mds-color-bg: var(--mds-gray-950); … }
```

- Light is the default, so the library works with no attribute set.
- Because it is an attribute selector, themes can be **nested** (a dark card inside a light page).
- `color-scheme` is set per theme so native controls and scrollbars match.
- Following the OS preference is the app's job (one line of JS setting `data-theme`), which keeps
  the CSS free of a duplicated `prefers-color-scheme` block and avoids a light/dark flash mismatch
  between SSR and client.

### 3. The CSS files are the source of truth; JS gets typed references

`@mds/tokens` ships `tokens.css` plus a typed object whose values are `var(--mds-…)` strings
(`color.primary === 'var(--mds-color-primary)'`). JS usage therefore stays theme-aware.
A unit test fails if the two drift apart, if light/dark define different token sets, or if a
semantic token references a missing primitive.

We chose hand-written CSS over a token pipeline (Style Dictionary, Tokens Studio) for now: there is
a single platform (web) and a single brand, so a build step would add complexity without payoff.
Revisit if we add native platforms or Figma sync.

### 4. Components are styled with CSS Modules

- Scoped class names, no runtime, no framework lock-in; the output is a plain `styles.css`.
- Built by tsup via esbuild's `local-css` loader; Storybook/Vitest use Vite's native support.
- States are expressed with attributes the component already sets for accessibility
  (`[aria-invalid='true']`, `[data-disabled]`, Radix's `[data-state='open']`), so styling and
  semantics cannot diverge.

### 5. Logical properties only

`margin-inline-start`, `padding-block`, `inset-inline-end`, `border-start-start-radius`, … are
used everywhere; `left`/`right` are forbidden. This makes every component correct in RTL
automatically. It is enforced three ways:

- `scripts/check-logical-css.mjs` (CI + pre-commit) rejects physical properties in `.css`.
- An ESLint rule rejects `marginLeft`, `paddingRight`, `left`, … in inline `style` props.
- A token test checks the token stylesheets themselves.

## Consequences

**Positive**

- Theming and direction are pure CSS: no provider, no re-render, works with SSR/RSC.
- Consumers can override any semantic token in their own CSS, no JS API required.
- RTL support costs nothing per component, and regressions are caught automatically.

**Negative / trade-offs**

- Consumers must import two stylesheets (`@mds/tokens/tokens.css`, `@mds/ui/styles.css`).
- CSS custom properties are not type-checked inside `.css` files; the token tests mitigate this.
- No component tier yet means deep theming of a single component requires overriding its class.
- Logical properties need modern browsers (all evergreen browsers since 2021) — acceptable.

## Alternatives considered

- **Tailwind** — fast to author, but forces a build dependency and class conventions on consumers.
- **CSS-in-JS (Emotion/styled-components)** — runtime cost, awkward with RSC, larger bundles.
- **vanilla-extract** — type-safe and zero-runtime, but adds a bundler plugin for every consumer
  of the source and couples us to its build tooling. A good upgrade path if types in CSS become a
  real pain.
