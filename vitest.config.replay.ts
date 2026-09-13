import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/replay/**/*.test.ts'],
    fileParallelism: false,
    testTimeout: 600_000,
    hookTimeout: 600_000,
  },
});
