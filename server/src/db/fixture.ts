import { sql } from 'kysely';
import { closeDatabase, db } from './kysely';
import { migrateToLatest } from './migrate';

/**
 * TypeORM owns user, verify and reset until 6/6, so the integration suite
 * recreates their live shape rather than importing the Nest migrations.
 * Kept in sync with 1662130125888-StartSeason2022.
 */
export async function createSchema(): Promise<void> {
  await sql`create extension if not exists "uuid-ossp"`.execute(db());
  await sql`
    create table if not exists "user" (
      "id" uuid not null default uuid_generate_v4(),
      "email" character varying not null,
      "password" character varying not null,
      "salt" character varying not null,
      "name" character varying not null,
      "settings" jsonb not null,
      "verified" boolean not null default false,
      "consentedAt" timestamp not null,
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now(),
      constraint "user_email_key" unique ("email"),
      constraint "user_pkey" primary key ("id")
    )`.execute(db());
  await sql`
    create table if not exists "verify" (
      "id" uuid not null default uuid_generate_v4(),
      "token" character varying not null,
      "createdAt" timestamp not null default now(),
      "userId" uuid references "user"("id") on delete cascade,
      constraint "verify_pkey" primary key ("id")
    )`.execute(db());
  await sql`
    create table if not exists "reset" (
      "id" uuid not null default uuid_generate_v4(),
      "token" character varying not null,
      "createdAt" timestamp not null default now(),
      "userId" uuid references "user"("id") on delete cascade,
      constraint "reset_pkey" primary key ("id")
    )`.execute(db());

  await sql`
    create table if not exists "division" (
      "name" character varying not null primary key,
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "team" (
      "id" character varying not null primary key,
      "logo" character varying not null,
      "abbreviation" character varying not null,
      "shortName" character varying not null,
      "name" character varying not null,
      "playoffSeed" integer,
      "wins" integer, "losses" integer, "ties" integer,
      "pointsFor" integer, "pointsAgainst" integer, "streak" integer,
      "color1" character varying, "color2" character varying,
      "divisionName" character varying references "division"("name"),
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "team_season" (
      "teamId" character varying not null references "team"("id") on delete cascade,
      "year" integer not null,
      "logo" character varying not null,
      "abbreviation" character varying not null,
      "shortName" character varying not null,
      "name" character varying not null,
      "divisionName" character varying references "division"("name"),
      "playoffSeed" integer,
      "wins" integer, "losses" integer, "ties" integer,
      "pointsFor" integer, "pointsAgainst" integer, "streak" integer,
      "color1" character varying, "color2" character varying,
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now(),
      primary key ("teamId", "year")
    )`.execute(db());
  await sql`
    create table if not exists "week" (
      "id" character varying not null primary key,
      "year" integer not null, "seasontype" integer not null, "week" integer not null,
      "start" timestamp not null, "end" timestamp not null,
      "label" character varying not null,
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "game" (
      "id" character varying not null primary key,
      "date" timestamp not null,
      "awayScore" integer not null, "homeScore" integer not null,
      "winner" character varying not null, "status" character varying not null,
      "weekId" character varying references "week"("id"),
      "homeTeamId" character varying references "team"("id"),
      "awayTeamId" character varying references "team"("id"),
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "league" (
      "id" uuid not null default uuid_generate_v4() primary key,
      "name" character varying not null,
      "season" integer not null,
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "member" (
      "leagueId" uuid not null references "league"("id") on delete cascade,
      "userId" uuid not null references "user"("id") on delete cascade,
      primary key ("leagueId", "userId")
    )`.execute(db());
  await sql`
    create table if not exists "bet" (
      "id" uuid not null default uuid_generate_v4() primary key,
      "winner" character varying not null, "pointDiff" integer not null,
      "gameId" character varying references "game"("id"),
      "userId" uuid references "user"("id"),
      "leagueId" uuid references "league"("id"),
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "betDoubler" (
      "id" uuid not null default uuid_generate_v4() primary key,
      "gameId" character varying references "game"("id"),
      "userId" uuid references "user"("id"),
      "leagueId" uuid references "league"("id"),
      "weekId" character varying references "week"("id"),
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "divisionBet" (
      "id" uuid not null default uuid_generate_v4() primary key,
      "year" integer not null,
      "divisionName" character varying references "division"("name"),
      "firstId" character varying references "team"("id"),
      "secondId" character varying references "team"("id"),
      "thirdId" character varying references "team"("id"),
      "fourthId" character varying references "team"("id"),
      "userId" uuid references "user"("id"),
      "leagueId" uuid references "league"("id"),
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());
  await sql`
    create table if not exists "superbowlBet" (
      "id" uuid not null default uuid_generate_v4() primary key,
      "year" integer not null,
      "teamId" character varying references "team"("id"),
      "userId" uuid references "user"("id"),
      "leagueId" uuid references "league"("id"),
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now()
    )`.execute(db());

  await migrateToLatest();
}

export async function truncate(): Promise<void> {
  await sql`truncate "session", "verify", "reset", "user", "league", "member",
            "bet", "betDoubler", "divisionBet", "superbowlBet", "game",
            "week", "team_season", "team", "division" cascade`.execute(db());
}

// Runnable so the smoke test can stand up a schema of its own instead of
// depending on the integration suite having run first.
if (import.meta.main) {
  await createSchema();
  await closeDatabase();
}
