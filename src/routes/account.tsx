import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import {
  accountSettings,
  renameUser,
  setHideByDefault,
  setSendReminder,
} from '../account/writes';
import { requireUser, type Variables } from '../auth/middleware';
import { basePath } from '../config';
import { Account } from '../views/Account';
import { Layout } from '../views/Layout';

export const account = new Hono<{ Variables: Variables }>();

// An unchecked box sends no field, so the key must be optional, not just undefined.
const checkbox = z
  .literal('on')
  .optional()
  .transform((value) => value === 'on');

account.get('/account', requireUser, async (c) => {
  const user = c.get('user');

  return c.html(
    <Layout title="Account" user={user}>
      <Account settings={await accountSettings(user.id)} />
    </Layout>,
  );
});

account.post(
  '/account/name',
  requireUser,
  zValidator('form', z.object({ name: z.string() })),
  async (c) => {
    const user = c.get('user');

    const result = await renameUser(user.id, c.req.valid('form').name);
    if (!result.ok) {
      return c.html(
        <Layout title="Account" user={user}>
          <Account
            settings={await accountSettings(user.id)}
            error="Der Name darf nicht leer sein."
          />
        </Layout>,
        400,
      );
    }

    return c.redirect(`${basePath}/account`, 303);
  },
);

account.post(
  '/account/spoiler',
  requireUser,
  zValidator('form', z.object({ hideByDefault: checkbox })),
  async (c) => {
    await setHideByDefault(c.get('user').id, c.req.valid('form').hideByDefault);

    return c.redirect(`${basePath}/account`, 303);
  },
);

account.post(
  '/account/reminder',
  requireUser,
  zValidator('form', z.object({ sendReminder: checkbox })),
  async (c) => {
    await setSendReminder(c.get('user').id, c.req.valid('form').sendReminder);

    return c.redirect(`${basePath}/account`, 303);
  },
);
