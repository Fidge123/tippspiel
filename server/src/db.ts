import { Pool } from 'pg';
import { databaseUrl } from './config';

let pool: Pool | undefined;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({ connectionString: databaseUrl, max: 4 });
  }
  return pool;
}

export async function isDatabaseReachable(): Promise<boolean> {
  try {
    await getPool().query('select 1');
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  await pool?.end();
  pool = undefined;
}
