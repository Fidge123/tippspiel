import { beforeAll, describe, expect, it, vi } from 'vitest';

// api.ts reads window.atob / window.localStorage at call time; a minimal stub
// keeps these tests in the plain node environment.
beforeAll(() => {
  vi.stubGlobal('window', {
    atob: (s: string) => Buffer.from(s, 'base64').toString('binary'),
    localStorage: {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    },
  });
});

const { validateToken } = await import('./api');

const tokenExpiringAt = (seconds: number) =>
  `header.${Buffer.from(JSON.stringify({ exp: seconds })).toString(
    'base64',
  )}.signature`;

const nowSeconds = () => Math.floor(Date.now() / 1000);

describe('validateToken', () => {
  it('accepts a token that is still valid', () => {
    expect(validateToken(tokenExpiringAt(nowSeconds() + 3600))).toBe(true);
  });

  it('rejects an expired token', () => {
    expect(validateToken(tokenExpiringAt(nowSeconds() - 3600))).toBe(false);
  });

  it('rejects a token inside the 5 second skew before expiry', () => {
    expect(validateToken(tokenExpiringAt(nowSeconds() + 3))).toBe(false);
  });

  it('accepts a token just outside the 5 second skew', () => {
    expect(validateToken(tokenExpiringAt(nowSeconds() + 10))).toBe(true);
  });

  it('accepts the empty token by default', () => {
    expect(validateToken('')).toBe(true);
  });

  it('rejects the empty token when accept_empty is false', () => {
    expect(validateToken('', false)).toBe(false);
  });

  it('rejects a malformed token, empty-token fallback or not', () => {
    expect(validateToken('not-a-jwt')).toBe(false);
    expect(validateToken('not-a-jwt', false)).toBe(false);
  });
});
