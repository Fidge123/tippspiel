import {
  createDatabase,
  startPostgres,
} from '../../backend/test/support/database';
import { startBackend } from './backend';
import { apiPort, webPort } from './ports';
import { seed } from './seed';
import { startWeb } from './web';

export default async function globalSetup(): Promise<() => Promise<void>> {
  const postgres = await startPostgres();
  const database = await createDatabase(postgres.adminUrl);
  const backend = await startBackend(database.url, apiPort);
  await seed(database.url);
  const web = await startWeb(webPort, apiPort);

  process.env.E2E_DATABASE_URL = database.url;

  return async () => {
    await web.stop();
    await backend.stop();
    await database.stop();
    await postgres.stop();
  };
}
