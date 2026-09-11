import type { Context } from 'hono';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { basePath, cookieSecret, secureCookies } from '../config';

export const SESSION_COOKIE = 'session';

// The retired SPA set this for 290 days, so browsers keep sending it until it
// is cleared.
const LEGACY_COOKIE = 'refreshToken';

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

export function clearAuthCookies(c: Context): void {
  deleteCookie(c, SESSION_COOKIE, options);
  deleteCookie(c, LEGACY_COOKIE, { ...options, path: '/' });
}
