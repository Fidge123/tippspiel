import {
  createDatabase,
  startPostgres,
} from '../../server/test/support/database';
import { serverPort } from './ports';
import { seed } from './seed';
import { startServer } from './server';

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

    const server = await startServer(database.url, serverPort);
    started.unshift(() => server.stop());

    await seed(database.url);

    process.env.E2E_DATABASE_URL = database.url;

    return teardown;
  } catch (error) {
    await teardown();
    throw error;
  }
}
