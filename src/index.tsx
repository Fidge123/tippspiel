import { app } from './app';
import { adminEmail, basePath, jobsEnabled, port, season } from './config';
import { checkEnvironment } from './env';
import { startJobs } from './jobs/cron';

checkEnvironment();

if (jobsEnabled) {
  startJobs();
}

console.log(
  `tippspiel listening on ${port}${basePath} season=${season} jobs=${jobsEnabled ? 'on' : 'off'} alerts=${adminEmail ?? 'none'}`,
);

export default { fetch: app.fetch, port };
