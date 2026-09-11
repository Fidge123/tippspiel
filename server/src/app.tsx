import { Hono } from 'hono';
import { currentUser, type Variables } from './auth/middleware';
import { basePath } from './config';
import { isDatabaseReachable } from './db/kysely';
import { auth } from './routes/auth';
import { leaderboard } from './routes/leaderboard';
import { schedule } from './routes/schedule';
import { Impressum } from './views/Impressum';
import { Layout } from './views/Layout';

// The SPA is served at /tippspiel/ and links to it with the trailing slash,
// so the schedule has to answer both spellings of the app root.
export const app = new Hono<{ Variables: Variables }>({
  strict: false,
}).basePath(basePath);

app.get('/health', async (c) => {
  const database = await isDatabaseReachable();
  return c.json(
    { status: database ? 'ok' : 'degraded', database },
    database ? 200 : 503,
  );
});

// Registered after /health so the health probe does not hit the session table.
app.use('*', currentUser);

app.route('/', auth);
app.route('/', leaderboard);
app.route('/', schedule);

app.get('/impressum', (c) =>
  c.html(
    <Layout title="Impressum" user={c.get('user')}>
      <Impressum />
    </Layout>,
  ),
);
