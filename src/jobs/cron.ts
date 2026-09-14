import { type JobName, JOBS, runJob, SCHEDULES } from './registry';

/**
 * A rejected Bun.cron handler reaches unhandledRejection, which ends the web server.
 * Swallowing here is narrower than a global listener that would hide real bugs too.
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
