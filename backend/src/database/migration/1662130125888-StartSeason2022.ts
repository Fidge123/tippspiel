import { MigrationInterface, QueryRunner } from 'typeorm';

export class StartSeason20221662130125888 implements MigrationInterface {
  name = 'StartSeason20221662130125888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "typeorm_metadata" ("type" varchar(255) NOT NULL, "database" varchar(255) DEFAULT NULL, "schema" varchar(255) DEFAULT NULL, "table" varchar(255) DEFAULT NULL, "name" varchar(255) DEFAULT NULL, "value" text)`,
    );
    await queryRunner.query(
      `CREATE TABLE "reset" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_5d04f4fd10772663543c6ccc512" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "verify" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "token" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "PK_c554da021aecbe3860c4b631be5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password" character varying NOT NULL, "salt" character varying NOT NULL, "name" character varying NOT NULL, "settings" jsonb NOT NULL, "verified" boolean NOT NULL DEFAULT false, "consentedAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "superbowlBet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "year" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "teamId" character varying, "userId" uuid, "leagueId" uuid, CONSTRAINT "PK_5bdc4915ccde383df0eb16c0bc6" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "league" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0bd74b698f9e28875df738f7864" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "divisionBet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "year" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "divisionName" character varying, "teamId" character varying, "userId" uuid, "leagueId" uuid, CONSTRAINT "PK_ebb19619dff8654fc623e5336dd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "division" ("name" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_296566b07c0653123c292aa2f85" PRIMARY KEY ("name"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "team" ("id" character varying NOT NULL, "logo" character varying NOT NULL, "abbreviation" character varying NOT NULL, "shortName" character varying NOT NULL, "name" character varying NOT NULL, "playoffSeed" integer, "wins" integer, "losses" integer, "ties" integer, "pointsFor" integer, "pointsAgainst" integer, "streak" integer, "color1" character varying, "color2" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "divisionName" character varying, CONSTRAINT "PK_f57d8293406df4af348402e4b74" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bye" ("teamId" character varying NOT NULL, "weekWeek" integer NOT NULL, "weekYear" integer NOT NULL, "weekSeasontype" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_9b5d83c2c4a81d8045144b5fc68" PRIMARY KEY ("teamId", "weekWeek", "weekYear", "weekSeasontype"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "week" ("year" integer NOT NULL, "seasontype" integer NOT NULL, "week" integer NOT NULL, "start" TIMESTAMP NOT NULL, "end" TIMESTAMP NOT NULL, "label" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_960a28d375395804d5ce7a7a0f2" PRIMARY KEY ("year", "seasontype", "week"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "betDoubler" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "gameId" character varying, "userId" uuid, "weekYear" integer, "weekSeasontype" integer, "weekWeek" integer, "leagueId" uuid, CONSTRAINT "PK_86b7307232e7e8822fddefbeb02" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "game" ("id" character varying NOT NULL, "date" TIMESTAMP NOT NULL, "awayScore" integer NOT NULL, "homeScore" integer NOT NULL, "winner" character varying NOT NULL, "status" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "weekYear" integer, "weekSeasontype" integer, "weekWeek" integer, "awayTeamId" character varying, "homeTeamId" character varying, CONSTRAINT "PK_352a30652cd352f552fef73dec5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "bet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "winner" character varying NOT NULL, "pointDiff" integer NOT NULL, "gameId" character varying, "userId" uuid, "leagueId" uuid, CONSTRAINT "PK_4ceea2cdef435807614b8e17aed" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "member" ("leagueId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_33fb0a114cfa389eaedef7ad4ad" PRIMARY KEY ("leagueId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_439998ed986bab5ccce25fb69d" ON "member" ("leagueId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_08897b166dee565859b7fb2fcc" ON "member" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "admin" ("leagueId" uuid NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_79fcd73148573cf4e07c3606272" PRIMARY KEY ("leagueId", "userId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_05c82c10f7c651b94c36370112" ON "admin" ("leagueId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_f8a889c4362d78f056960ca6da" ON "admin" ("userId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "reset" ADD CONSTRAINT "FK_667cdc8d0a3d3e5db228ae6fd6f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "verify" ADD CONSTRAINT "FK_076d3a77ca71ace5e2d2d47cc9d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "superbowlBet" ADD CONSTRAINT "FK_1b5aaa18aa7ee71b9bb2c5a504a" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "superbowlBet" ADD CONSTRAINT "FK_db8e24f19e8506b807c15a02660" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "superbowlBet" ADD CONSTRAINT "FK_a95035da5676fc3ba76279417c2" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_75bd2d496547e979b0752ce408d" FOREIGN KEY ("divisionName") REFERENCES "division"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_b0ff088e334067e8daf4c5e14eb" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_803fb683d12f38c1d8bf1514dba" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_9ae306a1080324e5dfa2ac7f3f5" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" ADD CONSTRAINT "FK_b26165dec51bf4779372ab399cd" FOREIGN KEY ("divisionName") REFERENCES "division"("name") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "FK_e36b26bfb4b65a95eac5bdbdbba" FOREIGN KEY ("weekYear", "weekSeasontype", "weekWeek") REFERENCES "week"("year","seasontype","week") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "FK_64072cdad2912c04f305967a989" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_9710c752a1ce65b0e66714feb1d" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_77b48151105414a855067c67e78" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_505c5923144d707c91090a67970" FOREIGN KEY ("weekYear", "weekSeasontype", "weekWeek") REFERENCES "week"("year","seasontype","week") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_c4ff5474eac77625549d97c4554" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_a18c608ef2def5a2ece613969bd" FOREIGN KEY ("weekYear", "weekSeasontype", "weekWeek") REFERENCES "week"("year","seasontype","week") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_1a206693bb12335a59cb181b355" FOREIGN KEY ("awayTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_6454b249c4795083f0233b59535" FOREIGN KEY ("homeTeamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet" ADD CONSTRAINT "FK_f276722ac17d4b80a327a9b8340" FOREIGN KEY ("gameId") REFERENCES "game"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet" ADD CONSTRAINT "FK_23a1f21c2ca2a0b6797564d2b41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet" ADD CONSTRAINT "FK_d0ef89e99e899c9c225ade76827" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_439998ed986bab5ccce25fb69d5" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" ADD CONSTRAINT "FK_08897b166dee565859b7fb2fcc8" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_05c82c10f7c651b94c36370112d" FOREIGN KEY ("leagueId") REFERENCES "league"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" ADD CONSTRAINT "FK_f8a889c4362d78f056960ca6dad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_f8a889c4362d78f056960ca6dad"`,
    );
    await queryRunner.query(
      `ALTER TABLE "admin" DROP CONSTRAINT "FK_05c82c10f7c651b94c36370112d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_08897b166dee565859b7fb2fcc8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "member" DROP CONSTRAINT "FK_439998ed986bab5ccce25fb69d5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet" DROP CONSTRAINT "FK_d0ef89e99e899c9c225ade76827"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet" DROP CONSTRAINT "FK_23a1f21c2ca2a0b6797564d2b41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bet" DROP CONSTRAINT "FK_f276722ac17d4b80a327a9b8340"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_6454b249c4795083f0233b59535"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_1a206693bb12335a59cb181b355"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_a18c608ef2def5a2ece613969bd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" DROP CONSTRAINT "FK_c4ff5474eac77625549d97c4554"`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" DROP CONSTRAINT "FK_505c5923144d707c91090a67970"`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" DROP CONSTRAINT "FK_77b48151105414a855067c67e78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "betDoubler" DROP CONSTRAINT "FK_9710c752a1ce65b0e66714feb1d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "FK_64072cdad2912c04f305967a989"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "FK_e36b26bfb4b65a95eac5bdbdbba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "team" DROP CONSTRAINT "FK_b26165dec51bf4779372ab399cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_9ae306a1080324e5dfa2ac7f3f5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_803fb683d12f38c1d8bf1514dba"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_b0ff088e334067e8daf4c5e14eb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_75bd2d496547e979b0752ce408d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "superbowlBet" DROP CONSTRAINT "FK_a95035da5676fc3ba76279417c2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "superbowlBet" DROP CONSTRAINT "FK_db8e24f19e8506b807c15a02660"`,
    );
    await queryRunner.query(
      `ALTER TABLE "superbowlBet" DROP CONSTRAINT "FK_1b5aaa18aa7ee71b9bb2c5a504a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "verify" DROP CONSTRAINT "FK_076d3a77ca71ace5e2d2d47cc9d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reset" DROP CONSTRAINT "FK_667cdc8d0a3d3e5db228ae6fd6f"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_f8a889c4362d78f056960ca6da"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_05c82c10f7c651b94c36370112"`,
    );
    await queryRunner.query(`DROP TABLE "admin"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_08897b166dee565859b7fb2fcc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_439998ed986bab5ccce25fb69d"`,
    );
    await queryRunner.query(`DROP TABLE "member"`);
    await queryRunner.query(`DROP TABLE "bet"`);
    await queryRunner.query(`DROP TABLE "game"`);
    await queryRunner.query(`DROP TABLE "betDoubler"`);
    await queryRunner.query(`DROP TABLE "week"`);
    await queryRunner.query(`DROP TABLE "bye"`);
    await queryRunner.query(`DROP TABLE "team"`);
    await queryRunner.query(`DROP TABLE "division"`);
    await queryRunner.query(`DROP TABLE "divisionBet"`);
    await queryRunner.query(`DROP TABLE "league"`);
    await queryRunner.query(`DROP TABLE "superbowlBet"`);
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "verify"`);
    await queryRunner.query(`DROP TABLE "reset"`);
    await queryRunner.query(`DROP TABLE "typeorm_metadata"`);
  }
}
