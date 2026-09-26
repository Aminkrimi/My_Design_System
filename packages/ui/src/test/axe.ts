import axe from 'axe-core';

/**
 * Runs axe-core against a rendered container and returns a readable list of
 * violations, so a failing assertion shows *what* is wrong, not just a count.
 *
 * `color-contrast` is disabled because jsdom has no layout/paint engine;
 * contrast is verified visually in Storybook via the a11y addon instead.
 */
export async function axeViolations(container: Element): Promise<string[]> {
  const results = await axe.run(container, {
    rules: { 'color-contrast': { enabled: false } },
  });
  return results.violations.map(
    (v) => `${v.id}: ${v.help} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`,
  );
}
