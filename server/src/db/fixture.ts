import { sql } from 'kysely';
import { db } from './kysely';
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

  await migrateToLatest();
}

export async function truncate(): Promise<void> {
  await sql`truncate "session", "verify", "reset", "user" cascade`.execute(
    db(),
  );
}
