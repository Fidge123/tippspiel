import { MigrationInterface, QueryRunner } from 'typeorm';

export class TeamSeason1757600000000 implements MigrationInterface {
  name = 'TeamSeason1757600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "team_season" (
        "teamId" character varying NOT NULL,
        "year" integer NOT NULL,
        "logo" character varying NOT NULL,
        "abbreviation" character varying NOT NULL,
        "shortName" character varying NOT NULL,
        "name" character varying NOT NULL,
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
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_team_season" PRIMARY KEY ("teamId", "year")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_season" ADD CONSTRAINT "FK_team_season_team"
       FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "team_season" ADD CONSTRAINT "FK_team_season_division"
       FOREIGN KEY ("divisionName") REFERENCES "division"("name") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_team_season_year" ON "team_season" ("year")`,
    );

    // The team row holds whatever the last import wrote, which is correct for
    // the newest season present and nothing else. Earlier seasons are
    // recoverable from the recorded ESPN responses in R2, not from here.
    await queryRunner.query(
      `INSERT INTO "team_season" (
         "teamId", "year", "logo", "abbreviation", "shortName", "name",
         "divisionName", "playoffSeed", "wins", "losses", "ties",
         "pointsFor", "pointsAgainst", "streak", "color1", "color2"
       )
       SELECT t."id", (SELECT MAX("year") FROM "week"), t."logo",
              t."abbreviation", t."shortName", t."name", t."divisionName",
              t."playoffSeed", t."wins", t."losses", t."ties",
              t."pointsFor", t."pointsAgainst", t."streak", t."color1", t."color2"
         FROM "team" t
        WHERE EXISTS (SELECT 1 FROM "week")
       ON CONFLICT DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "team_season"`);
  }
}
