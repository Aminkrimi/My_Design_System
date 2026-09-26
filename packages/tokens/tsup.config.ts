import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tokens: 'src/css/index.css',
  },
  format: ['esm', 'cjs'],
  // tsup's DTS worker still sets `baseUrl`, which TypeScript 6 deprecates.
  dts: { entry: 'src/index.ts', compilerOptions: { ignoreDeprecations: '6.0' } },
  clean: true,
  sourcemap: true,
});
