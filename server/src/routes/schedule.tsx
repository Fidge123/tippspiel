import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
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

const MESSAGES: Record<string, string> = {
  late: 'Zu spät: das Spiel hat bereits begonnen.',
  invalid: 'Diese Eingabe passt nicht zu diesem Spiel.',
  'not-a-member': 'Du bist kein Mitglied dieser Liga.',
  'no-doubler': 'Für diese Woche ist kein Doppler gesetzt.',
  form: 'Bitte wähle ein Team und einen Einsatz zwischen 1 und 5.',
};

type Ctx = Context<{ Variables: Variables }>;

async function renderSchedule(
  c: Ctx,
  errors: Map<string, string>,
  status: 200 | 400 = 200,
) {
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
        errors={errors}
      />
    </Layout>,
    status,
  );
}

schedule.get('/', (c) => renderSchedule(c, new Map()));

const back = (
  c: { redirect: (url: string, status: 303) => Response },
  anchor: string,
) => c.redirect(`${basePath}/${anchor}`, 303);

schedule.post(
  '/bet',
  zValidator('form', betForm, async (result, c) => {
    if (result.success) {
      return undefined;
    }
    // A rejected bet used to be a 200 with an empty body that nobody read (#10).
    const game = (await c.req.parseBody()).game;
    return renderSchedule(
      c as unknown as Ctx,
      new Map([[String(game ?? ''), MESSAGES.form]]),
      400,
    );
  }),
  async (c) => {
    const { game, league, winner, pointDiff } = c.req.valid('form');
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }

    const result = await setGameBet(user.id, league, game, winner, pointDiff);
    if (!result.ok) {
      return renderSchedule(c, new Map([[game, MESSAGES[result.reason]]]), 400);
    }

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

    const result = await setDoubler(user.id, league, week, game);
    if (!result.ok) {
      return renderSchedule(c, new Map([[game, MESSAGES[result.reason]]]), 400);
    }

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

    const result = await removeDoubler(user.id, league, week);
    if (!result.ok) {
      return renderSchedule(c, new Map([[week, MESSAGES[result.reason]]]), 400);
    }

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
