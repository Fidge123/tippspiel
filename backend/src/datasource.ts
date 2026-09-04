import { env } from 'node:process';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as entities from './database/entity';
import { migrations } from './database/migration';

export const config: DataSourceOptions = {
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: Object.values(entities),
  migrations,
  migrationsRun: true,
  maxQueryExecutionTime: 100,
  extra: {
    ssl: false,
  },
};

export default new DataSource(config);
