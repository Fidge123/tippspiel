import { cleanUp } from './cleanup';
import { importMasterData, importSchedule, updateGames } from './importer';
import { betReminder } from './reminder';

export const JOBS = {
  'import-master-data': importMasterData,
  'import-schedule': importSchedule,
  'update-games': updateGames,
  'bet-reminder': betReminder,
  'clean-up': cleanUp,
} as const;

export type JobName = keyof typeof JOBS;

/** The expressions the Nest @Cron decorators carried, read in the server's local time. */
export const SCHEDULES: Record<JobName, string> = {
  'import-master-data': '3 7 * Aug-Dec,Jan,Feb *',
  'import-schedule': '48 7 * Aug-Dec,Jan,Feb *',
  'update-games': '*/5 * * * *',
  'bet-reminder': '0 18 * Sep-Dec,Jan,Feb *',
  'clean-up': '0 * * * *',
};

export async function runJob(name: JobName): Promise<void> {
  const started = Date.now();
  const result = await JOBS[name]();
  console.log(
    `${name} finished in ${Date.now() - started}ms`,
    result ? JSON.stringify(result) : '',
  );
}
