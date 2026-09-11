import { createMiddleware } from 'hono/factory';
import { readSessionCookie } from './cookies';
import { readSession, type SessionUser } from './session';

export type Variables = { user: SessionUser | undefined };

export const currentUser = createMiddleware<{ Variables: Variables }>(
  async (c, next) => {
    const id = await readSessionCookie(c);
    const session = id ? await readSession(id) : undefined;

    c.set('user', session?.user);
    await next();
  },
);
