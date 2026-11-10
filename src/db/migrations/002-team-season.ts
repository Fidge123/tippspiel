import { type Kysely, sql } from 'kysely';

export async function up(db: Kysely<unknown>): Promise<void> {
  const { rows } = await sql<{ present: string | null }>`
    select to_regclass('public.team_season')::text as present
  `.execute(db);

  if (rows[0]?.present) {
    return;
  }

  await sql`
    create table "team_season" (
      "teamId" character varying not null,
      "year" integer not null,
      "logo" character varying not null,
      "abbreviation" character varying not null,
      "shortName" character varying not null,
      "name" character varying not null,
      "divisionName" character varying,
      "playoffSeed" integer,
      "wins" integer,
      "losses" integer,
      "ties" integer,
      "pointsFor" integer,
      "pointsAgainst" integer,
      "streak" integer,
      "color1" character varying,
      "color2" character varying,
      "createdAt" timestamp not null default now(),
      "updatedAt" timestamp not null default now(),
      constraint "PK_team_season" primary key ("teamId", "year"),
      constraint "FK_team_season_team" foreign key ("teamId")
        references "team"("id") on delete cascade,
      constraint "FK_team_season_division" foreign key ("divisionName")
        references "division"("name") on delete set null
    )`.execute(db);
  await sql`create index "IDX_team_season_year" on "team_season" ("year")`.execute(
    db,
  );

  // The team row only describes the newest imported season.
  await sql`
    insert into "team_season" (
      "teamId", "year", "logo", "abbreviation", "shortName", "name",
      "divisionName", "playoffSeed", "wins", "losses", "ties",
      "pointsFor", "pointsAgainst", "streak", "color1", "color2"
    )
    select t."id", (select max("year") from "week"), t."logo",
           t."abbreviation", t."shortName", t."name", t."divisionName",
           t."playoffSeed", t."wins", t."losses", t."ties",
           t."pointsFor", t."pointsAgainst", t."streak", t."color1", t."color2"
      from "team" t
     where exists (select 1 from "week")`.execute(db);
}

export async function down(db: Kysely<unknown>): Promise<void> {
  await db.schema.dropTable('team_season').execute();
}
