import { type JobName, JOBS, runJob, SCHEDULES } from './registry';

/**
 * Bun.cron escalates a rejected handler to unhandledRejection, which ends the
 * process, and here that process is the web server. Swallowing inside the
 * handler keeps a failed import from taking the site down, without a blanket
 * uncaughtException listener that would also hide real server bugs.
 */
export async function guard(
  name: string,
  run: () => Promise<unknown>,
): Promise<void> {
  try {
    await run();
  } catch (error) {
    console.error(`${name} failed`, error);
  }
}

export function startJobs(): Bun.CronJob[] {
  return (Object.keys(JOBS) as JobName[]).map((name) =>
    Bun.cron(SCHEDULES[name], () => guard(name, () => runJob(name))),
  );
}
