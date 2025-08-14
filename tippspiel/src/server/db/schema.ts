import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  email: varchar({ length: 256 }).unique().notNull(),
  password: varchar({ length: 256 }).notNull(),
  salt: varchar({ length: 256 }).notNull(),
  name: varchar({ length: 64 }).notNull(),
  settings: jsonb().notNull(),
  verified: boolean().default(false).notNull(),
  consentedAt: timestamp({ mode: "string" }).notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const season = pgTable("season", {
  id: integer().primaryKey().notNull(),
  start: timestamp({ mode: "string" }).notNull(),
  end: timestamp({ mode: "string" }).notNull(),
  current: boolean().default(false).notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const bet = pgTable(
  "bet",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    team: integer()
      .references(() => team.id)
      .notNull(),
    value: integer().notNull(),
    game: integer()
      .references(() => game.id, { onDelete: "cascade" })
      .notNull(),
    user: uuid()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    league: uuid()
      .references(() => league.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
  },
  (t) => [unique().on(t.game, t.user, t.league)],
);

export const divisionBet = pgTable(
  "divisionBet",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    division: varchar({ length: 16 })
      .references(() => division.id)
      .notNull(),
    user: uuid()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    league: uuid()
      .references(() => league.id, { onDelete: "cascade" })
      .notNull(),
    first: integer()
      .references(() => team.id)
      .notNull(),
    second: integer()
      .references(() => team.id)
      .notNull(),
    third: integer()
      .references(() => team.id)
      .notNull(),
    fourth: integer()
      .references(() => team.id)
      .notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
  },
  (t) => [unique().on(t.division, t.user, t.league)],
);

export const superbowlBet = pgTable(
  "superbowlBet",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    team: integer()
      .references(() => team.id)
      .notNull(),
    user: uuid()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    league: uuid()
      .references(() => league.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
  },
  (t) => [unique().on(t.user, t.league)],
);

export const betDoubler = pgTable(
  "betDoubler",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    bet: uuid()
      .references(() => bet.id, { onDelete: "cascade" })
      .notNull(),
    user: uuid()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
    league: uuid()
      .references(() => league.id, { onDelete: "cascade" })
      .notNull(),
    week: varchar({ length: 64 })
      .references(() => week.id)
      .notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "string" })
      .defaultNow()
      .$onUpdateFn(() => sql`now()`)
      .notNull(),
  },
  (t) => [unique().on(t.user, t.league, t.week)],
);

export const league = pgTable("league", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar({ length: 64 }).notNull(),
  season: integer()
    .references(() => season.id)
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const member = pgTable(
  "member",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    league: uuid()
      .references(() => league.id, { onDelete: "cascade" })
      .notNull(),
    user: uuid()
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => [unique().on(t.user, t.league)],
);

export const admin = pgTable(
  "admin",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    league: uuid()
      .references(() => league.id, { onDelete: "cascade" })
      .notNull(),
    user: uuid()
      .references(() => user.id)
      .notNull(),
  },
  (t) => [unique().on(t.user, t.league)],
);

export const resetToken = pgTable("resetToken", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  token: varchar({ length: 64 }).notNull(),
  user: uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const verifyToken = pgTable("verifyToken", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  token: varchar({ length: 64 }).notNull(),
  user: uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const failedLoginAttempt = pgTable("failedLoginAttempt", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  email: varchar({ length: 256 }).notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const team = pgTable("team", {
  id: integer().primaryKey().notNull(),
  code: varchar({ length: 4 }).notNull(),
  shortName: varchar({ length: 16 }).notNull(),
  name: varchar({ length: 32 }).notNull(),
  wins: integer(),
  losses: integer(),
  ties: integer(),
  season: integer()
    .references(() => season.id)
    .notNull(),
  logo: varchar({ length: 64 }).notNull(),
  color1: varchar({ length: 16 }),
  color2: varchar({ length: 16 }),
  division: varchar({ length: 16 }).references(() => division.id),
  position: integer(),
  pointsFor: integer(),
  pointsAgainst: integer(),
  streak: varchar({ length: 8 }),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const division = pgTable("division", {
  id: varchar({ length: 16 }).primaryKey().notNull(),
  conference: varchar({ length: 32 }).notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const bye = pgTable(
  "bye",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    team: integer()
      .references(() => team.id)
      .notNull(),
    week: varchar({ length: 64 })
      .references(() => week.id)
      .notNull(),
    createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  },
  (t) => [unique().on(t.team, t.week)],
);

export const week = pgTable("week", {
  id: varchar({ length: 64 }).primaryKey().notNull(),
  season: integer()
    .references(() => season.id)
    .notNull(),
  stage: varchar({ length: 32 }).notNull(),
  week: varchar({ length: 32 }).notNull(),
  start: timestamp({ mode: "string" }),
  end: timestamp({ mode: "string" }),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const game = pgTable("game", {
  id: integer().primaryKey().notNull(),
  date: timestamp({ mode: "string" }).notNull(),
  awayTeam: integer().references(() => team.id),
  homeTeam: integer().references(() => team.id),
  week: varchar({ length: 64 })
    .references(() => week.id)
    .notNull(),
  status: varchar({ length: 32 }).notNull(),
  awayScore: integer(),
  awayScoreQ1: integer(),
  awayScoreQ2: integer(),
  awayScoreQ3: integer(),
  awayScoreQ4: integer(),
  awayScoreOT: integer(),
  homeScore: integer(),
  homeScoreQ1: integer(),
  homeScoreQ2: integer(),
  homeScoreQ3: integer(),
  homeScoreQ4: integer(),
  homeScoreOT: integer(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});
