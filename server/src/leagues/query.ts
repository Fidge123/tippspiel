import { jsonArrayFrom } from 'kysely/helpers/postgres';
import { db } from '../db/kysely';

export interface LeagueMember {
  id: string;
  name: string;
  isAdmin: boolean;
}

export interface LeagueView {
  id: string;
  name: string;
  season: number;
  members: LeagueMember[];
  amAdmin: boolean;
}

export async function leaguesOfUser(userId: string): Promise<LeagueView[]> {
  const rows = await db()
    .selectFrom('league')
    .innerJoin('member', 'member.leagueId', 'league.id')
    .where('member.userId', '=', userId)
    .select((eb) => [
      'league.id as id',
      'league.name as name',
      'league.season as season',
      jsonArrayFrom(
        eb
          .selectFrom('member')
          .innerJoin('user', 'user.id', 'member.userId')
          .whereRef('member.leagueId', '=', 'league.id')
          .orderBy('user.name', 'asc')
          .select((m) => [
            'user.id as id',
            'user.name as name',
            m
              .exists(
                m
                  .selectFrom('admin')
                  .whereRef('admin.leagueId', '=', 'member.leagueId')
                  .whereRef('admin.userId', '=', 'member.userId'),
              )
              .as('isAdmin'),
          ]),
      ).as('members'),
      eb
        .exists(
          eb
            .selectFrom('admin')
            .whereRef('admin.leagueId', '=', 'league.id')
            .where('admin.userId', '=', userId),
        )
        .as('amAdmin'),
    ])
    .orderBy('league.season', 'desc')
    .orderBy('league.name', 'asc')
    .execute();

  return rows as LeagueView[];
}

export async function activeLeagueId(
  userId: string,
): Promise<string | undefined> {
  const row = await db()
    .selectFrom('user')
    .select('settings')
    .where('id', '=', userId)
    .executeTakeFirst();

  const settings = (row?.settings ?? {}) as { league?: string };
  return settings.league;
}

export async function setActiveLeague(
  userId: string,
  leagueId: string,
): Promise<void> {
  const row = await db()
    .selectFrom('user')
    .select('settings')
    .where('id', '=', userId)
    .executeTakeFirstOrThrow();

  await db()
    .updateTable('user')
    .set({
      settings: JSON.stringify({
        ...(row.settings as object),
        league: leagueId,
      }),
    })
    .where('id', '=', userId)
    .execute();
}
