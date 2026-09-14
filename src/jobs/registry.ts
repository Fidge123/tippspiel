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

/** Read in the server's local time zone, like crontab. */
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
