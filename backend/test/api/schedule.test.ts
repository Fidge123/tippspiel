import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GameEntity, TeamEntity, WeekEntity } from '../../src/database/entity';
import { sentEmails } from '../../src/email';
import { postSeason, regularSeason } from '../../src/schedule/schedule.service';
import { TestDatabase } from '../support/database';
import { ApiApp, bootApiApp } from './app';
import { freshDatabase } from './database';
import { EspnStub, installEspn, TEAMS, WeekKey } from './espn';

const kickoff = (key: WeekKey) =>
  new Date(Date.UTC(key.year, 8, 1) + key.week * 7 * 24 * 60 * 60 * 1000);

const FAILING_WEEK = 3;

describe('import on boot', () => {
  let database: TestDatabase;
  let api: ApiApp;
  let espn: EspnStub;

  beforeAll(async () => {
    database = await freshDatabase();
    sentEmails.length = 0;
    espn = installEspn((key) => ({
      kickoff: kickoff(key),
      status:
        key.week === 1
          ? 'STATUS_FINAL'
          : key.week === 2
            ? 'STATUS_IN_PROGRESS'
            : 'STATUS_SCHEDULED',
      winner: key.week === 1 ? 'home' : undefined,
      homeScore: key.week === 1 ? 24 : 0,
      awayScore: key.week === 1 ? 17 : 0,
      fail: key.seasontype === 2 && key.week === FAILING_WEEK,
    }));
    api = await bootApiApp(database.url, { importOnBoot: true });
  });

  afterAll(async () => {
    espn?.restore();
    await api?.close();
    await database?.stop();
  });

  it('imports the teams of every division', async () => {
    const teams = await api.dataSource.getRepository(TeamEntity).find();
    expect(teams).toHaveLength(TEAMS.length);
  });

  it('imports every week the season has', async () => {
    const weeks = await api.dataSource
      .getRepository(WeekEntity)
      .find({ order: { seasontype: 'ASC', week: 'ASC' } });

    expect(weeks.map((week) => week.id)).toEqual(
      [
        ...Array.from(
          { length: regularSeason.weeks },
          (_, index) => index + 1,
        ).filter((week) => week !== FAILING_WEEK),
      ]
        .map(
          (week) => `${regularSeason.year}-${regularSeason.seasonType}-${week}`,
        )
        .concat(postSeason.weeks.map((week) => `${postSeason.year}-3-${week}`)),
    );
  });

  it('imports scheduled, running and finished games alike', async () => {
    const games = await api.dataSource
      .getRepository(GameEntity)
      .find({ relations: { week: true } });
    const statusOf = (week: number) =>
      games.find((game) => game.week.id === `${regularSeason.year}-2-${week}`)
        ?.status;

    expect(statusOf(1)).toBe('STATUS_FINAL');
    expect(statusOf(2)).toBe('STATUS_IN_PROGRESS');
    expect(statusOf(4)).toBe('STATUS_SCHEDULED');
  });

  it('survives a failed ESPN request and reports it', async () => {
    expect(
      await api.dataSource
        .getRepository(WeekEntity)
        .findOneBy({ id: `${regularSeason.year}-2-${FAILING_WEEK}` }),
    ).toBeNull();
    expect(
      sentEmails.some((mail) => mail.Subject === 'API Request failed'),
    ).toBe(true);
  });
});
