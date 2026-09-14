import { Hono } from 'hono';
import { requireUser, type Variables } from '../auth/middleware';
import { Layout } from '../views/Layout';
import { Rules } from '../views/Rules';

export const rules = new Hono<{ Variables: Variables }>();

rules.get('/rules', requireUser, (c) =>
  c.html(
    <Layout title="Regeln" user={c.get('user')}>
      <Rules />
    </Layout>,
  ),
);
