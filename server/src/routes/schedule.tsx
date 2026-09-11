import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { z } from 'zod';
import type { Variables } from '../auth/middleware';
import { basePath } from '../config';
import { leaguesOf } from '../leaderboard/query';
import { scheduleFor, teamsForSeason } from '../schedule/query';
import {
  hiddenSettings,
  removeDoubler,
  setDoubler,
  setGameBet,
  setHidden,
} from '../schedule/writes';
import { Layout } from '../views/Layout';
import { Schedule } from '../views/Schedule/index';

export const schedule = new Hono<{ Variables: Variables }>();

const betForm = z.object({
  game: z.string().min(1),
  league: z.string().min(1),
  week: z.string().min(1),
  winner: z.enum(['home', 'away']),
  pointDiff: z.coerce.number().int().min(1).max(5),
});

const doublerForm = z.object({
  game: z.string().min(1),
  league: z.string().min(1),
  week: z.string().min(1),
});

const removeForm = z.object({
  league: z.string().min(1),
  week: z.string().min(1),
});

const hiddenForm = z.object({
  week: z.string().min(1),
  hidden: z.enum(['on', 'off']),
});

async function activeLeague(userId: string, requested?: string) {
  const leagues = await leaguesOf(userId);
  return leagues.find((league) => league.id === requested) ?? leagues[0];
}

schedule.get('/', async (c) => {
  const user = c.get('user');
  if (!user) {
    return c.redirect(`${basePath}/login`, 303);
  }

  const league = await activeLeague(user.id, c.req.query('league'));
  if (!league) {
    return c.html(
      <Layout title="Tippspiel" user={user}>
        <p class="p-4 text-center">Du bist noch in keiner Liga.</p>
      </Layout>,
      404,
    );
  }

  const [weeks, teams, settings] = await Promise.all([
    scheduleFor(league.id, league.season, user.id),
    teamsForSeason(league.season),
    hiddenSettings(user.id),
  ]);

  return c.html(
    <Layout title="Tippspiel" user={user}>
      <Schedule
        weeks={weeks}
        leagueId={league.id}
        teams={teams}
        hidden={settings.hidden}
        hideByDefault={settings.hideByDefault}
        now={new Date()}
        errors={new Map()}
      />
    </Layout>,
  );
});

const back = (
  c: { redirect: (url: string, status: 303) => Response },
  anchor: string,
) => c.redirect(`${basePath}/${anchor}`, 303);

schedule.post(
  '/bet',
  zValidator('form', betForm, (result, c) =>
    result.success ? undefined : c.redirect(`${basePath}/`, 303),
  ),
  async (c) => {
    const { game, league, winner, pointDiff } = c.req.valid('form');
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }

    await setGameBet(user.id, league, game, winner, pointDiff);

    return back(c, `#game-${game}`);
  },
);

schedule.post(
  '/doubler',
  zValidator('form', doublerForm, (result, c) =>
    result.success ? undefined : c.redirect(`${basePath}/`, 303),
  ),
  async (c) => {
    const { game, league, week } = c.req.valid('form');
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }

    await setDoubler(user.id, league, week, game);

    return back(c, `#week-${week}`);
  },
);

schedule.post(
  '/doubler/remove',
  zValidator('form', removeForm, (result, c) =>
    result.success ? undefined : c.redirect(`${basePath}/`, 303),
  ),
  async (c) => {
    const { league, week } = c.req.valid('form');
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }

    await removeDoubler(user.id, league, week);

    return back(c, `#week-${week}`);
  },
);

schedule.post(
  '/hidden',
  zValidator('form', hiddenForm, (result, c) =>
    result.success ? undefined : c.redirect(`${basePath}/`, 303),
  ),
  async (c) => {
    const { week, hidden } = c.req.valid('form');
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }

    await setHidden(user.id, week, hidden === 'on');

    return back(c, `#week-${week}`);
  },
);
