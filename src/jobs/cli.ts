import { closeDatabase } from '../db/kysely';
import { type JobName, JOBS, runJob } from './registry';

const name = process.argv[2] as JobName | undefined;

if (!name || !(name in JOBS)) {
  console.error(`Name the job to run, one of: ${Object.keys(JOBS).join(', ')}`);
  process.exit(1);
}

await runJob(name)
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDatabase);
