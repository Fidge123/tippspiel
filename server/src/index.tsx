import { serveStatic } from 'hono/bun';
import { app } from './app';
import { basePath, port } from './config';

// Registered from the Bun entry rather than app.tsx: hono/bun reaches for Bun
// globals, and app.tsx has to stay importable by the Vitest suite on Node.
app.get('/app.css', serveStatic({ path: './static/app.css' }));
app.get(
  '/*',
  serveStatic({
    root: './public',
    rewriteRequestPath: (path) => path.slice(basePath.length) || '/',
  }),
);

export default { fetch: app.fetch, port };
