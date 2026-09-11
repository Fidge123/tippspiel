import { zValidator } from '@hono/zod-validator';
import { type Context, Hono } from 'hono';
import { z } from 'zod';
import type { Variables } from '../auth/middleware';
import { basePath } from '../config';
import {
  divisions,
  myDivisionBets,
  mySuperbowlBet,
  pickCounts,
  seasonStart,
} from '../division/query';
import { setDivisionBet, setSuperbowlBet } from '../division/writes';
import { activeLeagueId, leaguesOfUser } from '../leagues/query';
import { Division } from '../views/Division';
import { Layout } from '../views/Layout';

export const division = new Hono<{ Variables: Variables }>();

type Ctx = Context<{ Variables: Variables }>;

const MESSAGES: Record<string, string> = {
  late: 'Die Saison hat begonnen, die Tipps sind geschlossen.',
  duplicate: 'Jedes Team darf in einer Division nur einmal vorkommen.',
  'not-a-member': 'Du bist kein Mitglied dieser Liga.',
  invalid: 'Bitte wähle für jede Position ein Team dieser Division.',
};

async function leagueOf(userId: string) {
  const [mine, active] = await Promise.all([
    leaguesOfUser(userId),
    activeLeagueId(userId),
  ]);
  return mine.find((l) => l.id === active) ?? mine[0];
}

async function render(
  c: Ctx,
  errors: Map<string, string>,
  status: 200 | 400 = 200,
) {
  const user = c.get('user');
  if (!user) {
    return c.redirect(`${basePath}/login`, 303);
  }

  const league = await leagueOf(user.id);
  if (!league) {
    return c.html(
      <Layout title="Divisions" user={user}>
        <p class="p-4 text-center">Du bist noch in keiner Liga.</p>
      </Layout>,
      404,
    );
  }

  const [all, picks, superbowl, counts, start] = await Promise.all([
    divisions(league.season),
    myDivisionBets(league.id, league.season, user.id),
    mySuperbowlBet(league.id, league.season, user.id),
    pickCounts(league.id, league.season),
    seasonStart(league.season),
  ]);

  return c.html(
    <Layout title="Divisions" user={user}>
      <Division
        divisions={all}
        picks={picks}
        superbowl={superbowl}
        counts={counts}
        closed={!start || new Date() >= start}
        errors={errors}
      />
    </Layout>,
    status,
  );
}

division.get('/division', (c) => render(c, new Map()));

division.post(
  '/division',
  zValidator(
    'form',
    z.object({
      division: z.string().min(1),
      team: z.union([z.array(z.string()), z.string()]),
    }),
  ),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }

    const league = await leagueOf(user.id);
    if (!league) {
      return render(c, new Map());
    }

    const { division: name, team } = c.req.valid('form');
    const teams = Array.isArray(team) ? team : [team];

    const result = await setDivisionBet(
      user.id,
      league.id,
      league.season,
      name,
      teams,
    );

    return result.ok
      ? c.redirect(`${basePath}/division`, 303)
      : render(c, new Map([[name, MESSAGES[result.reason]]]), 400);
  },
);

division.post(
  '/division/superbowl',
  zValidator('form', z.object({ team: z.string().min(1) })),
  async (c) => {
    const user = c.get('user');
    if (!user) {
      return c.redirect(`${basePath}/login`, 303);
    }

    const league = await leagueOf(user.id);
    if (!league) {
      return render(c, new Map());
    }

    const result = await setSuperbowlBet(
      user.id,
      league.id,
      league.season,
      c.req.valid('form').team,
    );

    return result.ok
      ? c.redirect(`${basePath}/division`, 303)
      : render(c, new Map([['superbowl', MESSAGES[result.reason]]]), 400);
  },
);
