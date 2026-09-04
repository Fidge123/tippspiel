import { DataSource } from 'typeorm';
import * as entities from '../../src/database/entity';
import { migrations } from '../../src/database/migration';

export async function runMigrations(url: string): Promise<string[]> {
  const dataSource = new DataSource({
    type: 'postgres',
    url,
    entities: Object.values(entities),
    migrations,
    extra: { ssl: false },
  });

  await dataSource.initialize();
  try {
    const applied = await dataSource.runMigrations({ transaction: 'all' });
    return applied.map((migration) => migration.name);
  } finally {
    await dataSource.destroy();
  }
}
