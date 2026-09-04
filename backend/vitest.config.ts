import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Nest's dependency injection and TypeORM's column types both come from
  // `emitDecoratorMetadata`, which esbuild does not implement.
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
    // Decorator metadata is only recorded if reflect-metadata is loaded before
    // the first entity module is evaluated.
    setupFiles: ['test/setup.ts'],
    // Replaying a season is a single long-lived database and app, so the
    // suites must not run in parallel against each other.
    fileParallelism: false,
    pool: 'forks',
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
