import { sql } from 'kysely';
import { db } from './kysely';
import { migrateToLatest } from './migrate';

export async function createSchema(): Promise<void> {
  await migrateToLatest();
}

export async function truncate(): Promise<void> {
  await sql`truncate "session", "verify", "reset", "user", "league", "member", "admin",
            "bet", "betDoubler", "divisionBet", "superbowlBet", "bye", "game",
            "week", "team_season", "team", "division" cascade`.execute(db());
}
