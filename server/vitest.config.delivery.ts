import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['test/delivery/**/*.test.ts'], testTimeout: 360_000 },
});
