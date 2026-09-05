import { randomUUID } from 'node:crypto';
import {
  DivisionEntity,
  GameEntity,
  LeagueEntity,
  TeamEntity,
  UserEntity,
  WeekEntity,
} from '../../src/database/entity';
import { regularSeason } from '../../src/schedule/schedule.service';
import { ApiApp } from './app';

export const SEASON = regularSeason.year;
export const PASSWORD = 'password1234';

export interface TestUser {
  id: string;
  name: string;
  email: string;
  password: string;
  verifyToken: string;
}

export async function createUser(
  api: ApiApp,
  options: { name?: string; email?: string; verified?: boolean } = {},
): Promise<TestUser> {
  const name = options.name ?? `user-${randomUUID().slice(0, 8)}`;
  const email = options.email ?? `${name}@example.invalid`;
  const [id, verifyToken] = await api.users.createUser(
    email,
    name,
    true,
    PASSWORD,
  );
  if (options.verified !== false) {
    await api.users.verify(id, verifyToken);
  }
  return { id, name, email, password: PASSWORD, verifyToken };
}

export async function createLeague(
  api: ApiApp,
  admin: TestUser,
  name = 'Testliga',
): Promise<LeagueEntity> {
  return api.leagues.createLeague(name, admin.id);
}

export async function addMember(
  api: ApiApp,
  league: LeagueEntity,
  admin: TestUser,
  member: TestUser,
): Promise<void> {
  await api.leagues.addMember(league.id, member.email, admin.id);
}

export async function seedTeams(api: ApiApp): Promise<TeamEntity[]> {
  const division = await api.dataSource.getRepository(DivisionEntity).save({
    name: 'AFC North',
  });
  const abbreviations = ['BAL', 'CIN', 'CLE', 'PIT'];
  return api.dataSource.getRepository(TeamEntity).save(
    abbreviations.map((abbreviation, index) => ({
      id: `s:20~l:28~t:${abbreviation}`,
      logo: `${abbreviation.toLowerCase()}.png`,
      abbreviation,
      shortName: abbreviation,
      name: `${abbreviation} Team`,
      division,
      playoffSeed: index + 1,
    })),
  );
}

export interface GamePlan {
  kickoff: Date;
  status?: string;
  winner?: 'home' | 'away' | 'none';
}

export async function seedWeek(
  api: ApiApp,
  teams: TeamEntity[],
  plans: GamePlan[],
  options: { week?: number; seasontype?: number; year?: number } = {},
): Promise<{ week: WeekEntity; games: GameEntity[] }> {
  const year = options.year ?? SEASON;
  const seasontype = options.seasontype ?? 2;
  const number = options.week ?? 1;
  const first = plans[0].kickoff;

  const week = await api.dataSource.getRepository(WeekEntity).save({
    id: `${year}-${seasontype}-${number}`,
    year,
    seasontype,
    week: number,
    start: new Date(first.getTime() - 3 * 24 * 60 * 60 * 1000),
    end: new Date(first.getTime() + 4 * 24 * 60 * 60 * 1000),
    label: `Week ${number}`,
  });

  const games = await api.dataSource.getRepository(GameEntity).save(
    plans.map((plan, index) => ({
      id: `${week.id}-game-${index}`,
      date: plan.kickoff,
      week,
      homeTeam: teams[(index * 2) % teams.length],
      awayTeam: teams[(index * 2 + 1) % teams.length],
      homeScore: 0,
      awayScore: 0,
      winner: plan.winner ?? 'none',
      status: plan.status ?? 'STATUS_SCHEDULED',
    })),
  );

  return { week, games };
}

export async function ageRow(
  api: ApiApp,
  table: string,
  id: string,
  age: number,
): Promise<void> {
  await api.dataSource.query(
    `UPDATE "${table}" SET "createdAt" = $1 WHERE id = $2`,
    [new Date(Date.now() - age), id],
  );
}

export async function reload(
  api: ApiApp,
  league: LeagueEntity,
): Promise<LeagueEntity> {
  return api.leagues.getLeague(league.id);
}

export async function userById(
  api: ApiApp,
  id: string,
): Promise<UserEntity | null> {
  return api.dataSource.getRepository(UserEntity).findOneBy({ id });
}
