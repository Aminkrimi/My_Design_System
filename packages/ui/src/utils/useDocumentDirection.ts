import type { Direction } from '@mds/tokens';
import { useSyncExternalStore } from 'react';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['dir'] });
  return () => observer.disconnect();
}

const getSnapshot = (): Direction => (document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr');
const getServerSnapshot = (): Direction => 'ltr';

/**
 * The document's text direction (`<html dir>`), kept in sync when it changes.
 *
 * Radix primitives assume LTR unless they are given a `dir` (Select even writes
 * `dir="ltr"` onto its trigger), while this library takes direction from the
 * DOM like the rest of its CSS. Components pass this value to Radix so RTL
 * works without a provider; an explicit `dir` prop still wins for subtrees.
 */
export function useDocumentDirection(): Direction {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
