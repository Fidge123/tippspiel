import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  email: varchar().unique().notNull(),
  password: varchar().notNull(),
  salt: varchar().notNull(),
  name: varchar().notNull(),
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

export const bet = pgTable("bet", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  team: integer()
    .references(() => team.id)
    .notNull(),
  value: integer().notNull(),
  game: integer()
    .references(() => game.id)
    .notNull(),
  user: uuid()
    .references(() => user.id)
    .notNull(),
  league: uuid()
    .references(() => league.id)
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const superbowlBet = pgTable("superbowlBet", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  team: integer()
    .references(() => team.id)
    .notNull(),
  user: uuid()
    .references(() => user.id)
    .notNull(),
  league: uuid()
    .references(() => league.id)
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const resetToken = pgTable("resetToken", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  token: varchar().notNull(),
  user: uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const verifyToken = pgTable("verifyToken", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  token: varchar().notNull(),
  user: uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
});

export const failedLoginAttempt = pgTable("failedLoginAttempt", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  email: varchar().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const team = pgTable("team", {
  id: integer().primaryKey().notNull(),
  code: varchar().notNull(),
  shortName: varchar(),
  name: varchar().notNull(),
  wins: integer(),
  losses: integer(),
  ties: integer(),
  season: integer()
    .references(() => season.id)
    .notNull(),
  logo: varchar().notNull(),
  color1: varchar(),
  color2: varchar(),
  division: varchar()
    .references(() => division.id)
    .notNull(),
  position: integer(),
  pointsFor: integer(),
  pointsAgainst: integer(),
  streak: integer(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const division = pgTable("division", {
  id: varchar().primaryKey().notNull(),
  conference: varchar().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const bye = pgTable("bye", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  team: integer()
    .references(() => team.id)
    .notNull(),
  week: varchar()
    .references(() => week.id)
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const divisionBet = pgTable("divisionBet", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  division: varchar()
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
});

export const league = pgTable("league", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar().notNull(),
  season: integer()
    .references(() => season.id)
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const week = pgTable("week", {
  id: varchar().primaryKey().notNull(),
  season: integer()
    .references(() => season.id)
    .notNull(),
  stage: varchar().notNull(),
  week: varchar().notNull(),
  start: timestamp({ mode: "string" }),
  end: timestamp({ mode: "string" }),
  label: varchar().notNull(),
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
  week: varchar()
    .references(() => week.id)
    .notNull(),
  status: varchar().notNull(),
  awayScore: integer().notNull(),
  awayScoreQ1: integer().notNull(),
  awayScoreQ2: integer().notNull(),
  awayScoreQ3: integer().notNull(),
  awayScoreQ4: integer().notNull(),
  awayScoreOT: integer().notNull(),
  homeScore: integer().notNull(),
  homeScoreQ1: integer().notNull(),
  homeScoreQ2: integer().notNull(),
  homeScoreQ3: integer().notNull(),
  homeScoreQ4: integer().notNull(),
  homeScoreOT: integer().notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const betDoubler = pgTable("betDoubler", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  game: integer()
    .references(() => game.id)
    .notNull(),
  user: uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
  league: uuid()
    .references(() => league.id, { onDelete: "cascade" })
    .notNull(),
  week: varchar()
    .references(() => week.id)
    .notNull(),
  createdAt: timestamp({ mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: "string" })
    .defaultNow()
    .$onUpdateFn(() => sql`now()`)
    .notNull(),
});

export const member = pgTable("member", {
  league: uuid()
    .references(() => league.id, { onDelete: "cascade" })
    .notNull(),
  user: uuid()
    .references(() => user.id, { onDelete: "cascade" })
    .notNull(),
});

export const admin = pgTable("admin", {
  league: uuid()
    .references(() => league.id, { onDelete: "cascade" })
    .notNull(),
  user: uuid()
    .references(() => user.id)
    .notNull(),
});
