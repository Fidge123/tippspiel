import { randomBytes, randomUUID, scrypt } from 'node:crypto';
import { promisify } from 'node:util';
import { Client } from 'pg';

export const season = 2026;
export const password = 'tippspiel1234';

export const users = {
  alice: { name: 'Alice', email: 'alice@example.invalid' },
  bob: { name: 'Bob', email: 'bob@example.invalid' },
};

export const league = 'Testliga';

export const weeks = {
  finished: { id: `${season}-2-1`, label: 'Week 1' },
  upcoming: { id: `${season}-2-2`, label: 'Week 2' },
};

export const teams = {
  ravens: { id: 'BAL', name: 'Baltimore Ravens', abbreviation: 'BAL' },
  bengals: { id: 'CIN', name: 'Cincinnati Bengals', abbreviation: 'CIN' },
  browns: { id: 'CLE', name: 'Cleveland Browns', abbreviation: 'CLE' },
  steelers: { id: 'PIT', name: 'Pittsburgh Steelers', abbreviation: 'PIT' },
  cowboys: { id: 'DAL', name: 'Dallas Cowboys', abbreviation: 'DAL' },
  eagles: { id: 'PHI', name: 'Philadelphia Eagles', abbreviation: 'PHI' },
};

export const games = {
  finishedFirst: { id: `${weeks.finished.id}-1`, home: 'BAL', away: 'CIN' },
  finishedSecond: { id: `${weeks.finished.id}-2`, home: 'CLE', away: 'PIT' },
  upcomingFirst: { id: `${weeks.upcoming.id}-1`, home: 'CLE', away: 'BAL' },
  upcomingSecond: { id: `${weeks.upcoming.id}-2`, home: 'PIT', away: 'CIN' },
  upcomingThird: { id: `${weeks.upcoming.id}-3`, home: 'PHI', away: 'DAL' },
};

export const scores = { finishedFirst: [17, 24], finishedSecond: [21, 14] };

const days = 24 * 60 * 60 * 1000;

export async function seed(databaseUrl: string): Promise<void> {
  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await seedTeams(client);
    await seedSchedule(client);
    const alice = await createUser(client, users.alice);
    const bob = await createUser(client, users.bob);
    const leagueId = await createLeague(client, [alice, bob], alice);
    await seedBets(client, leagueId, alice, bob);
  } finally {
    await client.end();
  }
}

async function seedTeams(client: Client): Promise<void> {
  const divisions = {
    'AFC North': [teams.ravens, teams.bengals, teams.browns, teams.steelers],
    'NFC East': [teams.cowboys, teams.eagles],
  };
  for (const [division, members] of Object.entries(divisions)) {
    await client.query('INSERT INTO "division" ("name") VALUES ($1)', [
      division,
    ]);
    for (const team of members) {
      await client.query(
        `INSERT INTO "team"
         ("id", "logo", "abbreviation", "shortName", "name", "divisionName", "color1", "color2")
         VALUES ($1, $2, $3, $3, $4, $5, '241773', '000000')`,
        [
          team.id,
          `${team.abbreviation.toLowerCase()}.png`,
          team.abbreviation,
          team.name,
          division,
        ],
      );
    }
  }
}

// Kickoffs sit days away from now so that neither deadline nor the score
// import that follows a kickoff depends on when the suite runs.
async function seedSchedule(client: Client): Promise<void> {
  const now = Date.now();
  await createWeek(client, weeks.finished, 1, now - 9 * days, now - 2 * days);
  await createWeek(client, weeks.upcoming, 2, now + 1 * days, now + 8 * days);

  await createGame(client, {
    ...games.finishedFirst,
    week: weeks.finished.id,
    date: new Date(now - 8 * days),
    scores: scores.finishedFirst,
    winner: 'home',
    status: 'STATUS_FINAL',
  });
  await createGame(client, {
    ...games.finishedSecond,
    week: weeks.finished.id,
    date: new Date(now - 7 * days),
    scores: scores.finishedSecond,
    winner: 'away',
    status: 'STATUS_FINAL',
  });
  await createGame(client, {
    ...games.upcomingFirst,
    week: weeks.upcoming.id,
    date: new Date(now + 2 * days),
  });
  await createGame(client, {
    ...games.upcomingSecond,
    week: weeks.upcoming.id,
    date: new Date(now + 3 * days),
  });
  await createGame(client, {
    ...games.upcomingThird,
    week: weeks.upcoming.id,
    date: new Date(now + 4 * days),
  });
}

async function createWeek(
  client: Client,
  week: { id: string; label: string },
  number: number,
  start: number,
  end: number,
): Promise<void> {
  await client.query(
    `INSERT INTO "week" ("id", "year", "seasontype", "week", "start", "end", "label")
     VALUES ($1, $2, 2, $3, $4, $5, $6)`,
    [week.id, season, number, new Date(start), new Date(end), week.label],
  );
}

interface GamePlan {
  id: string;
  week: string;
  date: Date;
  home: string;
  away: string;
  scores?: number[];
  winner?: string;
  status?: string;
}

async function createGame(client: Client, game: GamePlan): Promise<void> {
  const [away, home] = game.scores ?? [0, 0];
  await client.query(
    `INSERT INTO "game"
     ("id", "date", "weekId", "homeTeamId", "awayTeamId", "homeScore", "awayScore", "winner", "status")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [
      game.id,
      game.date,
      game.week,
      game.home,
      game.away,
      home,
      away,
      game.winner ?? 'none',
      game.status ?? 'STATUS_SCHEDULED',
    ],
  );
}

async function createUser(
  client: Client,
  user: { name: string; email: string },
): Promise<string> {
  const id = randomUUID();
  const salt = randomBytes(128);
  await client.query(
    `INSERT INTO "user"
     ("id", "email", "name", "password", "salt", "settings", "verified", "consentedAt")
     VALUES ($1, $2, $3, $4, $5, '{}', true, now())`,
    [
      id,
      user.email,
      user.name,
      await hash(password, salt),
      salt.toString('hex'),
    ],
  );
  return id;
}

async function createLeague(
  client: Client,
  members: string[],
  admin: string,
): Promise<string> {
  const id = randomUUID();
  await client.query(
    'INSERT INTO "league" ("id", "name", "season") VALUES ($1, $2, $3)',
    [id, league, season],
  );
  for (const member of members) {
    await client.query(
      'INSERT INTO "member" ("leagueId", "userId") VALUES ($1, $2)',
      [id, member],
    );
  }
  await client.query(
    'INSERT INTO "admin" ("leagueId", "userId") VALUES ($1, $2)',
    [id, admin],
  );
  return id;
}

async function seedBets(
  client: Client,
  leagueId: string,
  alice: string,
  bob: string,
): Promise<void> {
  const bets = [
    { user: alice, game: games.finishedFirst.id, winner: 'home', points: 3 },
    { user: alice, game: games.finishedSecond.id, winner: 'away', points: 2 },
    { user: bob, game: games.finishedFirst.id, winner: 'away', points: 1 },
    { user: bob, game: games.finishedSecond.id, winner: 'away', points: 4 },
  ];
  for (const bet of bets) {
    await client.query(
      `INSERT INTO "bet" ("id", "gameId", "userId", "leagueId", "winner", "pointDiff")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [randomUUID(), bet.game, bet.user, leagueId, bet.winner, bet.points],
    );
  }
}

// Same derivation as hash() in backend/src/database/user.service.ts.
async function hash(value: string, salt: Buffer): Promise<string> {
  const derived = await promisify(scrypt)(value.normalize(), salt, 128);
  return (derived as Buffer).toString('hex');
}
