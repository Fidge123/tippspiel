import { closeDatabase } from '../db/kysely';
import { cleanUp } from './cleanup';
import { importMasterData, importSchedule, updateGames } from './importer';
import { betReminder } from './reminder';

const JOBS = {
  'import-master-data': importMasterData,
  'import-schedule': importSchedule,
  'update-games': updateGames,
  'bet-reminder': betReminder,
  'clean-up': cleanUp,
} as const;

type JobName = keyof typeof JOBS;

async function main(): Promise<void> {
  const name = process.argv[2] as JobName | undefined;

  if (!name || !(name in JOBS)) {
    throw new Error(
      `Name the job to run, one of: ${Object.keys(JOBS).join(', ')}`,
    );
  }

  const started = Date.now();
  const result = await JOBS[name]();
  console.log(
    `${name} finished in ${Date.now() - started}ms`,
    result ? JSON.stringify(result) : '',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
