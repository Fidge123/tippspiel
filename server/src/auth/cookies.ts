import type { Context } from 'hono';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { sign } from 'hono/jwt';
import {
  basePath,
  cookieSecret,
  refreshSecret,
  secureCookies,
} from '../config';
import type { SessionUser } from './session';

export const SESSION_COOKIE = 'session';
export const LEGACY_COOKIE = 'refreshToken';

// Lax rather than Strict: Strict drops the cookie when the user arrives from an
// emailed verification or reset link, which is how those flows are entered.
const options = {
  httpOnly: true,
  secure: secureCookies,
  sameSite: 'Lax',
  path: basePath,
} as const;

export async function setSessionCookie(
  c: Context,
  id: string,
  expiresAt: Date,
): Promise<void> {
  await setSignedCookie(c, SESSION_COOKIE, id, cookieSecret, {
    ...options,
    expires: expiresAt,
  });
}

export async function readSessionCookie(
  c: Context,
): Promise<string | undefined> {
  const value = await getSignedCookie(c, cookieSecret, SESSION_COOKIE);
  return typeof value === 'string' ? value : undefined;
}

/**
 * The SPA trades this cookie for an access token at POST user/refresh. Issuing
 * it here keeps the SPA working unchanged while pages move to Hono; it is
 * deleted along with the SPA in 6/6.
 */
export async function setLegacyRefreshCookie(
  c: Context,
  { id, name, email }: SessionUser,
): Promise<void> {
  if (!refreshSecret) {
    return;
  }

  const now = Math.floor(Date.now() / 1000);
  // HS256 and this payload are what @nestjs/jwt signed, so refresh.strategy.ts
  // verifies the token unchanged.
  const token = await sign(
    { id, name, email, iat: now, exp: now + 365 * 24 * 60 * 60 },
    refreshSecret,
    'HS256',
  );

  c.header(
    'Set-Cookie',
    `${LEGACY_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax${
      secureCookies ? '; Secure' : ''
    }; Max-Age=${(29 * 24 * 60 * 60 * 10000) / 1000}`,
    { append: true },
  );
}

export function clearAuthCookies(c: Context): void {
  deleteCookie(c, SESSION_COOKIE, options);
  deleteCookie(c, LEGACY_COOKIE, { ...options, path: '/' });
}
