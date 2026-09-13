import { Hono } from 'hono';
import type { Variables } from '../auth/middleware';
import { basePath } from '../config';
import { buildLeaderboard } from '../leaderboard/build';
import {
  anonymousBets,
  divisionsWithTeams,
  leaguesOf,
  seasonSchedule,
  seasonTeams,
} from '../leaderboard/query';
import { Leaderboard } from '../views/Leaderboard/index';
import { Layout } from '../views/Layout';

export const leaderboard = new Hono<{ Variables: Variables }>();

leaderboard.get('/leaderboard', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.redirect(`${basePath}/login`, 303);
  }

  const leagues = await leaguesOf(user.id);
  const requested = c.req.query('league');
  const league = leagues.find((l) => l.id === requested) ?? leagues[0];

  if (!league) {
    return c.html(
      <Layout title="Tabelle" user={user}>
        <p class="p-4 text-center">Du bist noch in keiner Liga.</p>
      </Layout>,
      404,
    );
  }

  const season = Number(c.req.query('season') ?? league.season);
  const board = await buildLeaderboard(league.id, season, user.id);

  if (!board) {
    return c.text('Diese Liga hat diese Saison nicht gespielt.', 400);
  }

  const [weeks, teams, divisions, anonymous] = await Promise.all([
    seasonSchedule(season),
    seasonTeams(season),
    divisionsWithTeams(season),
    anonymousBets(league.id, season),
  ]);

  return c.html(
    <Layout title="Tabelle" user={user}>
      <Leaderboard
        board={board}
        leagues={leagues}
        weeks={weeks}
        teams={teams}
        divisions={divisions}
        anonymous={anonymous}
      />
    </Layout>,
  );
});
