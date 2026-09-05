import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { WeekEntity } from '../../src/database/entity';
import { TestDatabase } from '../support/database';
import { ApiApp, bootApiApp } from './app';
import { freshDatabase } from './database';
import { EspnStub, installEspn, WeekKey } from './espn';

const kickoff = (key: WeekKey) =>
  new Date(Date.UTC(key.year, 8, 1) + key.week * 7 * 24 * 60 * 60 * 1000);

describe('boot', () => {
  let database: TestDatabase;
  let api: ApiApp;
  let espn: EspnStub;

  beforeAll(async () => {
    database = await freshDatabase();
    espn = installEspn((key) => ({ kickoff: kickoff(key) }));
    api = await bootApiApp(database.url);
  });

  afterAll(async () => {
    espn?.restore();
    await api?.close();
    await database?.stop();
  });

  it('does not import anything unless IMPORT_ON_BOOT is set', async () => {
    expect(espn.calls).toEqual([]);
    expect(await api.dataSource.getRepository(WeekEntity).count()).toBe(0);
  });
});
