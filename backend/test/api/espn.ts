import { BASE_URL } from '../../src/schedule/schedule.service';

export interface WeekKey {
  year: number;
  seasontype: number;
  week: number;
}

export interface WeekPlan {
  kickoff: Date;
  status?: string;
  homeScore?: number;
  awayScore?: number;
  winner?: 'home' | 'away';
  fail?: boolean;
}

export const DIVISIONS = [
  { name: 'AFC North', teams: ['BAL', 'CIN', 'CLE', 'PIT'] },
  { name: 'AFC South', teams: ['HOU', 'IND', 'JAX', 'TEN'] },
];

export const TEAMS = DIVISIONS.flatMap((division) => division.teams);

export function teamId(abbreviation: string): string {
  return `s:20~l:28~t:${abbreviation}`;
}

export interface EspnStub {
  calls: string[];
  restore(): void;
}

export function installEspn(plan: (key: WeekKey) => WeekPlan): EspnStub {
  const real = globalThis.fetch;
  const calls: string[] = [];

  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = String(input instanceof Request ? input.url : input);
    calls.push(url);

    if (!url.startsWith(BASE_URL)) {
      throw new Error(`Unexpected network call in an API test: ${url}`);
    }

    const path = url.slice(BASE_URL.length);

    if (path === 'groups') {
      return json(groups());
    }
    if (path.startsWith('teams/')) {
      return json({ team: team(path.slice('teams/'.length)) });
    }
    if (path.startsWith('scoreboard?')) {
      const query = new URLSearchParams(path.slice('scoreboard?'.length));
      const key = {
        year: Number(query.get('dates')),
        seasontype: Number(query.get('seasontype')),
        week: Number(query.get('week')),
      };
      const week = plan(key);
      return week.fail
        ? new Response('', { status: 503 })
        : json(scoreboard(key, week));
    }

    throw new Error(`No recorded ESPN response for ${url}`);
  }) as typeof fetch;

  return {
    calls,
    restore: () => {
      globalThis.fetch = real;
    },
  };
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}

function groups() {
  return {
    groups: [
      {
        abbreviation: 'AFC',
        children: DIVISIONS.map((division) => ({
          name: division.name,
          teams: division.teams.map((abbreviation) => ({ id: abbreviation })),
        })),
      },
    ],
  };
}

function team(abbreviation: string) {
  return {
    uid: teamId(abbreviation),
    abbreviation,
    shortDisplayName: abbreviation,
    displayName: `${abbreviation} Team`,
    logos: [{ href: `https://logos.invalid/${abbreviation}.png` }],
    color: '241773',
    alternateColor: '000000',
    record: {
      items: [
        {
          stats: [
            { name: 'wins', value: 1 },
            { name: 'losses', value: 1 },
          ],
        },
      ],
    },
  };
}

function scoreboard(key: WeekKey, plan: WeekPlan) {
  const status = plan.status ?? 'STATUS_SCHEDULED';
  const pairs = DIVISIONS.map((division) => division.teams);

  return {
    leagues: [
      {
        calendar: [1, 2, 3].map((seasontype) => ({
          entries: Array.from({ length: 18 }, (_, index) => ({
            label: `Week ${index + 1}`,
            startDate: new Date(
              plan.kickoff.getTime() - 3 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            endDate: new Date(
              plan.kickoff.getTime() + 4 * 24 * 60 * 60 * 1000,
            ).toISOString(),
            value: `${seasontype}-${index + 1}`,
          })),
        })),
      },
    ],
    week: {
      number: key.week,
      teamsOnBye: [{ uid: teamId('TEN') }],
    },
    events: pairs.map((teams, index) => ({
      uid: `s:20~l:28~e:${key.year}${key.seasontype}${key.week}${index}`,
      date: plan.kickoff.toISOString(),
      competitions: [
        {
          status: { type: { name: status } },
          competitors: [
            {
              homeAway: 'home',
              uid: teamId(teams[0]),
              score: String(plan.homeScore ?? 0),
              winner: plan.winner === 'home',
            },
            {
              homeAway: 'away',
              uid: teamId(teams[1]),
              score: String(plan.awayScore ?? 0),
              winner: plan.winner === 'away',
            },
          ],
        },
      ],
    })),
  };
}
