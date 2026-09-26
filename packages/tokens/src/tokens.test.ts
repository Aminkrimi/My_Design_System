import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { color, shadow, tokens } from './index';

const read = (file: string) =>
  readFileSync(fileURLToPath(new URL(`./css/${file}`, import.meta.url)), 'utf8');

const primitivesCss = read('primitives.css');
const semanticCss = read('semantic.css');
const allCss = primitivesCss + semanticCss;

/** Returns the custom-property names declared inside the block that starts at `selector`. */
function declaredIn(css: string, selector: string): Set<string> {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`Selector not found: ${selector}`);
  const open = css.indexOf('{', start);
  const close = css.indexOf('}', open);
  return new Set(css.slice(open, close).match(/--mds-[\w-]+(?=\s*:)/g) ?? []);
}

const varName = (ref: string) => ref.slice('var('.length, -1);
const allRefs = Object.values(tokens).flatMap((g) => Object.values(g));

describe('tokens', () => {
  it('every exported JS token is declared in CSS', () => {
    const declared = new Set(allCss.match(/--mds-[\w-]+(?=\s*:)/g));
    const missing = allRefs.map(varName).filter((name) => !declared.has(name));
    expect(missing).toEqual([]);
  });

  it('light and dark themes define exactly the same semantic tokens', () => {
    const light = declaredIn(semanticCss, ":root,\n[data-theme='light']");
    const dark = declaredIn(semanticCss, "[data-theme='dark']");
    expect([...dark].sort()).toEqual([...light].sort());
  });

  it('every themed color and shadow token is exported to JS', () => {
    const themed = declaredIn(semanticCss, "[data-theme='dark']");
    const exported = new Set([...Object.values(color), ...Object.values(shadow)].map(varName));
    expect([...themed].filter((name) => !exported.has(name))).toEqual([]);
  });

  it('semantic tokens only reference primitives that exist', () => {
    const declared = new Set(primitivesCss.match(/--mds-[\w-]+(?=\s*:)/g));
    const referenced = [...semanticCss.matchAll(/var\((--mds-[\w-]+)\)/g)].map((m) => m[1]);
    expect(referenced.filter((name) => name && !declared.has(name))).toEqual([]);
  });

  it('stylesheets use logical properties only', () => {
    const physical = /(?:margin|padding|border)-(?:left|right)\b|(?<![-\w])(?:left|right)\s*:/;
    expect(allCss + read('base.css')).not.toMatch(physical);
  });
});
