import {
  createDatabase,
  startPostgres,
} from '../../backend/test/support/database';
import { startBackend } from './backend';
import { apiPort, webPort } from './ports';
import { seed } from './seed';
import { startWeb } from './web';

export default async function globalSetup(): Promise<() => Promise<void>> {
  const started: (() => Promise<void>)[] = [];
  const teardown = async () => {
    for (const stop of started) {
      await stop();
    }
  };

  try {
    const postgres = await startPostgres();
    started.unshift(() => postgres.stop());

    const database = await createDatabase(postgres.adminUrl);
    started.unshift(() => database.stop());

    const backend = await startBackend(database.url, apiPort);
    started.unshift(() => backend.stop());

    await seed(database.url);

    const web = await startWeb(webPort, apiPort);
    started.unshift(() => web.stop());

    process.env.E2E_DATABASE_URL = database.url;

    return teardown;
  } catch (error) {
    await teardown();
    throw error;
  }
}
