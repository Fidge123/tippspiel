import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Nest DI and TypeORM column types need emitDecoratorMetadata, which esbuild lacks.
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2021',
        parser: { syntax: 'typescript', decorators: true },
        transform: {
          legacyDecorator: true,
          decoratorMetadata: true,
          useDefineForClassFields: false,
        },
      },
    }),
  ],
  test: {
    globals: false,
    environment: 'node',
    root: __dirname,
    include: ['test/**/*.test.ts'],
    // reflect-metadata must load before the first entity module is evaluated.
    setupFiles: ['test/setup.ts'],
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
