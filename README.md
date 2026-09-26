# My Design System

An accessible, **RTL-first** React component library — built with TypeScript, CSS Modules and
design tokens as CSS custom properties.

> 🚧 Work in progress. Week 1: infrastructure, tokens and Storybook are in place; components are next.

## Packages

| Package                            | Description                                                         |
| ---------------------------------- | ------------------------------------------------------------------- |
| [`@mds/tokens`](./packages/tokens) | Design tokens as CSS variables + typed JS references                |
| [`@mds/ui`](./packages/ui)         | React components (ESM + CJS + types, built with tsup)               |
| [`@mds/docs`](./apps/docs)         | Storybook with theme (light/dark) and direction (LTR/RTL) switching |

## Getting started

Requires Node 22+ and pnpm 10 (`corepack enable`).

```bash
pnpm install
pnpm storybook      # http://localhost:6006
```

| Command          | What it does                                     |
| ---------------- | ------------------------------------------------ |
| `pnpm build`     | Build all packages and the static Storybook      |
| `pnpm lint`      | ESLint (incl. jsx-a11y, React hooks)             |
| `pnpm lint:css`  | Reject physical CSS properties (RTL safety)      |
| `pnpm typecheck` | `tsc --noEmit` in every package (`strict: true`) |
| `pnpm test`      | Vitest + Testing Library + axe                   |
| `pnpm format`    | Prettier                                         |

## Usage

```tsx
import '@mds/tokens/tokens.css';
import '@mds/ui/styles.css';

<html data-theme="dark" dir="rtl" lang="fa">
  …
</html>;
```

## Conventions

- **Commits** follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced by commitlint).
- **Styles** use logical properties only (`margin-inline-start`, never `margin-left`).
- **Components** read semantic tokens only (`--mds-color-primary`, never `--mds-blue-600`).
- Decisions are recorded in [`docs/adr`](./docs/adr).
