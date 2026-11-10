import { createMiddleware } from 'hono/factory';
import { basePath } from '../config';
import { readSessionCookie, setSessionCookie } from './cookies';
import { readSession, type SessionUser } from './session';

export type Variables = { user: SessionUser | undefined };
export type AuthedVariables = { user: SessionUser };

export const currentUser = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const id = await readSessionCookie(c);
    const session = id ? await readSession(id) : undefined;

    if (id && session?.renewedUntil) {
      await setSessionCookie(c, id, session.renewedUntil);
    }

    c.set('user', session?.user);
    await next();
  },
);

/**
 * Narrows `user` for the handlers behind it, so a route that forgets it fails to compile.
 * Per route, because `use('*')` would also cover every route registered after it.
 */
export const requireUser = createMiddleware<{ Variables: AuthedVariables }>(
  async (c, next) => {
    if (!c.get('user')) {
      return c.redirect(`${basePath}/login`, 303);
    }
    await next();
  },
);
