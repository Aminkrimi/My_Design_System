import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  // tsup's DTS worker still sets `baseUrl`, which TypeScript 6 deprecates.
  dts: { compilerOptions: { ignoreDeprecations: '6.0' } },
  sourcemap: true,
  clean: true,
  target: 'es2022',
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // `*.module.css` files are compiled by esbuild's `local-css` loader:
  // class names are scoped and everything is emitted to `dist/index.css`.
  loader: { '.module.css': 'local-css' },
  esbuildOptions(options) {
    options.jsx = 'automatic';
    // Components rely on hooks/effects; mark the bundle as client-only for RSC frameworks.
    options.banner = { js: '"use client";' };
  },
});
