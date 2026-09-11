import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const here = dirname(fileURLToPath(import.meta.url));
const legacy = join(here, '..', '..', 'backend', 'src', 'bet', 'scoring.ts');

/**
 * The scoring rules were moved, not rewritten, and the golden master only
 * proves that while both copies say the same thing. Goes away with backend/
 * in 6/6, which is why a missing legacy copy is not a failure.
 */
describe('the copy of scoring.ts', () => {
  it('is byte-identical to the one the Nest app scores with', () => {
    let expected: string;
    try {
      expected = readFileSync(legacy, 'utf8');
    } catch {
      return;
    }

    expect(readFileSync(join(here, 'scoring.ts'), 'utf8')).toBe(expected);
  });
});
