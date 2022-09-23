import { env } from 'process';
import { DataSource, DataSourceOptions } from 'typeorm';

const extra = env.DATABASE_URL.includes('localhost')
  ? {
      // synchronize: true,
      ssl: false,
    }
  : {
      ssl: {
        rejectUnauthorized: false,
        enabled: true,
      },
    };

export const config: DataSourceOptions = {
  type: 'postgres',
  url: env.DATABASE_URL,
  entities: [__dirname + '/database/entity/*.entity.ts'],
  migrations: [__dirname + '/database/migration/*.ts'],
  migrationsRun: true,
  maxQueryExecutionTime: 100,
  extra,
};

export default new DataSource(config);
