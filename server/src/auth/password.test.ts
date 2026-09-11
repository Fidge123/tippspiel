import { scryptSync } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { hash, KEY_LENGTH, verifyPassword } from './password';

// Pinned rather than assumed: the epic's runtime choice rests on Bun and Node
// deriving the same key for the parameters the existing rows were written with,
// so stored passwords keep working after the cutover.
const SALT = Buffer.from('a'.repeat(KEY_LENGTH * 2), 'hex');
const PASSWORD = 'correct horse battery staple';

describe('scrypt', () => {
  it('derives the key the stored rows were written with', async () => {
    const derived = await hash(PASSWORD, SALT);

    expect(derived).toHaveLength(KEY_LENGTH);
    expect(derived.toString('hex')).toBe(
      scryptSync(PASSWORD.normalize(), SALT, KEY_LENGTH).toString('hex'),
    );
  });

  it('normalises the password the way the Nest app did', async () => {
    const composed = await hash('\u00e9', SALT);
    const decomposed = await hash('e\u0301', SALT);

    expect(composed.toString('hex')).toBe(decomposed.toString('hex'));
  });
});

describe('verifyPassword', () => {
  const stored = {
    salt: SALT.toString('hex'),
    password: scryptSync(PASSWORD, SALT, KEY_LENGTH).toString('hex'),
  };

  it('accepts the right password', async () => {
    expect(await verifyPassword(PASSWORD, stored)).toBe(true);
  });

  it('rejects the wrong password', async () => {
    expect(await verifyPassword('wrong', stored)).toBe(false);
  });

  it('rejects, rather than throws, when there is no such user', async () => {
    expect(await verifyPassword(PASSWORD, undefined)).toBe(false);
  });
});
