import { Hono } from 'hono';
import { basePath } from './config';
import { isDatabaseReachable } from './db';
import { Impressum } from './views/Impressum';
import { Layout } from './views/Layout';

export const app = new Hono().basePath(basePath);

app.get('/health', async (c) => {
  const database = await isDatabaseReachable();
  return c.json(
    { status: database ? 'ok' : 'degraded', database },
    database ? 200 : 503,
  );
});

app.get('/impressum', (c) =>
  c.html(
    <Layout title="Impressum">
      <Impressum />
    </Layout>,
  ),
);
