import { Hono } from 'hono';
import type { Variables } from '../auth/middleware';
import { basePath } from '../config';
import { Layout } from '../views/Layout';
import { Rules } from '../views/Rules';

export const rules = new Hono<{ Variables: Variables }>();

rules.get('/rules', (c) => {
  const user = c.get('user');
  if (!user) {
    return c.redirect(`${basePath}/login`, 303);
  }

  return c.html(
    <Layout title="Regeln" user={user}>
      <Rules />
    </Layout>,
  );
});
