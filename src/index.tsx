import { serveStatic } from 'hono/bun';
import { app } from './app';
import { adminEmail, basePath, jobsEnabled, port, season } from './config';
import { checkEnvironment } from './env';
import { startJobs } from './jobs/cron';

checkEnvironment();

// Serving belongs to the entry point; app.tsx stays the routes.
app.get('/app.css', serveStatic({ path: './static/app.css' }));
app.get(
  '/*',
  serveStatic({
    root: './public',
    rewriteRequestPath: (path) => path.slice(basePath.length) || '/',
  }),
);

if (jobsEnabled) {
  startJobs();
}

console.log(
  `tippspiel listening on ${port}${basePath} season=${season} jobs=${jobsEnabled ? 'on' : 'off'} alerts=${adminEmail ?? 'none'}`,
);

export default { fetch: app.fetch, port };
