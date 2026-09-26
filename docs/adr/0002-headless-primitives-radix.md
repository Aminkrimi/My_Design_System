# ADR 0002 — Headless primitives (Radix) for complex widgets

- **Status:** Accepted
- **Date:** 2026-09-27
- **Deciders:** Amin Karimi

## Context

`Button` and `Input` wrap native elements, so the browser supplies their behaviour. `Modal`,
`Toast` and `Select` have no native equivalent we can style and ship everywhere, and their hard
part is behaviour, not looks: focus trapping and restoring, `Esc` and outside-click dismissal,
scroll locking, hiding the page from screen readers, listbox keyboard navigation, typeahead, and
live-region announcements. Getting that right across browsers and screen readers is the
bug-prone part, and it is where a one-person library can least afford subtle bugs.

## Decision

Build these components on **Radix UI primitives** (`@radix-ui/react-dialog`, `-toast`, `-select`)
and keep our own **API, styling and defaults** on top.

**Why headless, and why Radix**

- **Behaviour is the expensive part, and it's solved.** Radix implements the WAI-ARIA patterns
  and is tested across assistive technology; we own none of that code.
- **Unstyled fits ADR 0001.** Radix ships no CSS. It exposes state as attributes
  (`data-state`, `data-highlighted`, `data-disabled`) that our CSS Modules style with semantic
  tokens, so no styling system comes along.
- **One package per primitive.** Consumers only pay for what they import.
- **Alternatives.** _React Aria_ is the strongest option (best i18n), but its hooks API means we'd
  write every DOM node and more glue per component. _Headless UI_ is Tailwind-oriented and lacks a
  toast. _Building it ourselves_ repeats solved work and adds a11y risk.

**Where we designed the API ourselves.** Radix's compound parts (`Root`, `Trigger`, `Content`…)
stay internal. Each component exposes a small, prop-driven API that makes the accessible path the
default:

| Component | Our API                                                                          | Why                                                                                                                                                                |
| --------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Modal`   | `title` (required), `description`, `footer`, `size`, `trigger`, `ModalClose`     | A required `title` means every dialog has an accessible name. `description` is wired to `aria-describedby` only when present.                                      |
| `Modal`   | Sets `aria-modal="true"`; restores focus without a `trigger`                     | Radix only hides the page with `aria-hidden`, and returns focus to its own `Trigger` only. A modal opened from state used to drop focus on `<body>`.               |
| `Toast`   | `ToastProvider` + `useToast()` → `toast({ title, variant, … })` returns an id    | Radix toasts are declarative. Apps want to fire one from an event handler, so the provider owns the queue.                                                         |
| `Toast`   | `variant` sets announcement and timing: `error` is assertive and stays open      | An error that vanishes after 5 s fails WCAG 2.2.1 (Timing Adjustable) in practice. Info and success are polite and auto-close; hover and focus pause them (Radix). |
| `Toast`   | `action` requires `altText`                                                      | Screen readers announce how to do the action elsewhere, since the toast may be gone.                                                                               |
| `Select`  | Same field API as `Input`: `label`, `helperText`, `error`, `required`, `options` | Forms look and read the same. Errors set `aria-invalid` and join `aria-describedby`.                                                                               |
| all       | Direction comes from `<html dir>` (`useDocumentDirection`), `dir` prop overrides | Radix assumes LTR without a `DirectionProvider`, and Select writes `dir="ltr"` onto its trigger. Reading the DOM keeps ADR 0001's "direction is pure CSS" promise. |

Every item above is covered by a behavioural test that fails without the workaround.

## Consequences

**Positive**

- Keyboard and screen-reader behaviour comes from a maintained library. Our tests cover our
  contract (names, focus return, announcements, RTL), not Radix internals.
- The public API stays small and can outlive Radix: Radix types never appear in our props, except
  `ModalClose`, which is a re-export.

**Negative / trade-offs**

- A runtime dependency per component, and upgrades need our tests re-run. The workarounds above
  depend on Radix internals (`onCloseAutoFocus`, the Select trigger's `dir`) and must be rechecked
  on major bumps.
- Portaled content (Modal, Toast announcements, the Select list) renders in `<body>`. Themes and
  direction therefore have to be set on `<html>`; a `data-theme` scoped to a subtree won't reach it.
- Prop-driven APIs cover fewer layouts than compound parts (for example, a custom modal header or
  grouped options). We'll add parts when a real need appears, not before.
- jsdom lacks APIs Radix uses (pointer capture, `scrollIntoView`, `ResizeObserver`); the test setup
  stubs them. Colour contrast and real positioning are checked in Storybook, not in unit tests.
- In a real browser, axe reports two false positives while a Select list is open. It flags
  `aria-hidden-focus` on the page behind, but focus is trapped in the list, so the hidden trigger
  can't be reached. It flags `scrollable-region-focusable` on a long list, but options are reached
  with the arrow keys, Home and End, which scroll it. Radix doesn't set `aria-modal` on a listbox
  (that would be invalid), which is why axe exempts the Modal and not the Select. Don't "fix" these
  by adding tab stops.
