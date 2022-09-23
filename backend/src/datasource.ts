import { env } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

export const config: DataSourceOptions = {
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [__dirname + '/database/entity/*.entity.ts'],
  migrations: [__dirname + '/database/migration/*.ts'],
  migrationsRun: true,
  maxQueryExecutionTime: 100,
  extra: {
    ssl: false,
  },
};

export default new DataSource(config);
