#!/usr/bin/env node
// Fails if any authored stylesheet uses physical (left/right) properties.
// We only allow logical properties (margin-inline-start, inset-inline-end, …)
// so every component is correct in both LTR and RTL without overrides.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['packages', 'apps'];
const SKIP = new Set(['node_modules', 'dist', 'storybook-static', 'coverage', '.turbo']);
const PHYSICAL = [
  [/\b(margin|padding|border)-(left|right)\b/, 'use *-inline-start / *-inline-end'],
  [/\bborder-(top|bottom)-(left|right)-radius\b/, 'use border-start-start-radius etc.'],
  [/(?<![-\w])(left|right)\s*:/, 'use inset-inline-start / inset-inline-end'],
  [
    /\b(float|clear|text-align)\s*:\s*(left|right)\b/,
    'use inline-start / inline-end or start / end',
  ],
];

function* cssFiles(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* cssFiles(path);
    else if (entry.name.endsWith('.css')) yield path;
  }
}

const problems = [];
for (const root of ROOTS.filter((dir) => existsSync(dir))) {
  for (const file of cssFiles(root)) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, i) => {
        if (line.trim().startsWith('/*') || line.trim().startsWith('*')) return;
        for (const [pattern, hint] of PHYSICAL) {
          if (pattern.test(line)) {
            problems.push(`${relative('.', file)}:${i + 1}  ${line.trim()}  → ${hint}`);
          }
        }
      });
  }
}

if (problems.length > 0) {
  console.error(`Physical CSS properties found (RTL-unsafe):\n\n${problems.join('\n')}`);
  process.exit(1);
}
console.log('✓ All stylesheets use logical properties.');
