import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { z } from 'zod';
import type { Variables } from '../auth/middleware';
import { basePath } from '../config';
import {
  activeLeagueId,
  leaguesOfUser,
  setActiveLeague,
} from '../leagues/query';
import type { LeagueError, LeagueResult } from '../leagues/writes';
import * as writes from '../leagues/writes';
import { Layout } from '../views/Layout';
import { Leagues } from '../views/Leagues';

export const leagues = new Hono<{ Variables: Variables }>();

type Ctx = Context<{ Variables: Variables }>;

const MESSAGES: Record<LeagueError, string> = {
  'not-admin': 'Dafür musst du Admin dieser Liga sein.',
  'no-such-user': 'Zu dieser E-Mail gibt es kein Konto.',
  'no-such-league': 'Diese Liga gibt es nicht.',
  'name-too-short': 'Der Name muss mindestens 3 Zeichen lang sein.',
  'already-admin': 'Dieses Mitglied ist bereits Admin.',
  'not-a-member': 'Diese Person ist kein Mitglied dieser Liga.',
  'not-an-admin': 'Diese Person ist kein Admin dieser Liga.',
  'already-a-member': 'Diese Person ist bereits Mitglied dieser Liga.',
  'last-admin': 'Die Liga braucht mindestens einen Admin.',
  'last-member': 'Die Liga braucht mindestens ein Mitglied.',
};

async function render(c: Ctx, error?: string, status: 200 | 400 = 200) {
  const user = c.get('user');
  if (!user) {
    return c.redirect(`${basePath}/login`, 303);
  }

  const [mine, active] = await Promise.all([
    leaguesOfUser(user.id),
    activeLeagueId(user.id),
  ]);

  return c.html(
    <Layout title="Ligen" user={user}>
      <Leagues leagues={mine} activeId={active} error={error} />
    </Layout>,
    status,
  );
}

async function act(c: Ctx, result: LeagueResult) {
  return result.ok
    ? c.redirect(`${basePath}/leagues`, 303)
    : render(c, MESSAGES[result.reason], 400);
}

const leagueAndUser = z.object({
  league: z.string().min(1),
  user: z.string().min(1),
});

leagues.get('/leagues', (c) => render(c));

leagues.post(
  '/leagues/create',
  zValidator('form', z.object({ name: z.string() })),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }
    return act(c, await writes.createLeague(c.req.valid('form').name, user.id));
  },
);

leagues.post(
  '/leagues/rename',
  zValidator('form', z.object({ league: z.string().min(1), name: z.string() })),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }
    const { league, name } = c.req.valid('form');
    return act(c, await writes.renameLeague(league, name, user.id));
  },
);

leagues.post(
  '/leagues/delete',
  zValidator(
    'form',
    z.object({ league: z.string().min(1), confirm: z.string() }),
  ),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }
    const { league, confirm } = c.req.valid('form');

    // The SPA asked for the name in a prompt(); without script it is a field,
    // and it is still the only thing standing between a click and a lost season.
    const mine = await leaguesOfUser(user.id);
    const target = mine.find((l) => l.id === league);
    if (!target || target.name !== confirm) {
      return render(c, 'Der Name stimmt nicht mit der Liga überein.', 400);
    }

    return act(c, await writes.deleteLeague(league, user.id));
  },
);

leagues.post(
  '/leagues/add',
  zValidator(
    'form',
    z.object({ league: z.string().min(1), email: z.string().email() }),
  ),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }
    const { league, email } = c.req.valid('form');
    return act(c, await writes.addMember(league, email, user.id));
  },
);

leagues.post('/leagues/kick', zValidator('form', leagueAndUser), async (c) => {
  const me = c.get('user');
  if (!me) {
    return c.redirect(`${basePath}/login`, 303);
  }
  const { league, user } = c.req.valid('form');
  return act(c, await writes.removeMember(league, user, me.id));
});

leagues.post(
  '/leagues/promote',
  zValidator('form', leagueAndUser),
  async (c) => {
    const me = c.get('user');
    if (!me) {
      return c.redirect(`${basePath}/login`, 303);
    }
    const { league, user } = c.req.valid('form');
    return act(c, await writes.promote(league, user, me.id));
  },
);

leagues.post(
  '/leagues/demote',
  zValidator('form', leagueAndUser),
  async (c) => {
    const me = c.get('user');
    if (!me) {
      return c.redirect(`${basePath}/login`, 303);
    }
    const { league, user } = c.req.valid('form');
    return act(c, await writes.demote(league, user, me.id));
  },
);

leagues.post(
  '/leagues/activate',
  zValidator('form', z.object({ league: z.string().min(1) })),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }
    const { league } = c.req.valid('form');

    const mine = await leaguesOfUser(user.id);
    if (!mine.some((l) => l.id === league)) {
      return render(c, MESSAGES['not-a-member'], 400);
    }

    await setActiveLeague(user.id, league);

    return c.redirect(`${basePath}/leagues`, 303);
  },
);
