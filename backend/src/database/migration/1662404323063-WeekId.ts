import { MigrationInterface, QueryRunner } from 'typeorm';

export class WeekId1662404323063 implements MigrationInterface {
  name = 'WeekId1662404323063';

  public async up(qr: QueryRunner): Promise<void> {
    // drop constraints
    await qr.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "FK_e36b26bfb4b65a95eac5bdbdbba"`,
    );
    await qr.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "FK_64072cdad2912c04f305967a989"`,
    );
    await qr.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "PK_9b5d83c2c4a81d8045144b5fc68"`,
    );
    await qr.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_a18c608ef2def5a2ece613969bd"`,
    );
    await qr.query(
      `ALTER TABLE "betDoubler" DROP CONSTRAINT "FK_505c5923144d707c91090a67970"`,
    );
    await qr.query(
      `ALTER TABLE "week" DROP CONSTRAINT "PK_960a28d375395804d5ce7a7a0f2"`,
    );

    await qr.query(`ALTER TABLE "bye" ADD "weekId" character varying`);
    await qr.query(
      `UPDATE "bye" SET "weekId" = CONCAT(CAST("weekYear" AS VARCHAR), '-', CAST("weekSeasontype" AS VARCHAR), '-', CAST("weekWeek" AS VARCHAR))`,
    );
    await qr.query(`ALTER TABLE "bye" DROP COLUMN "weekYear"`);
    await qr.query(`ALTER TABLE "bye" DROP COLUMN "weekSeasontype"`);
    await qr.query(`ALTER TABLE "bye" DROP COLUMN "weekWeek"`);
    await qr.query(
      `ALTER TABLE "bye" ADD "id" uuid NOT NULL DEFAULT uuid_generate_v4()`,
    );

    // Game

    await qr.query(`ALTER TABLE "game" ADD "weekId" character varying`);
    await qr.query(
      `UPDATE "game" SET "weekId" = CONCAT(CAST("weekYear" AS VARCHAR), '-', CAST("weekSeasontype" AS VARCHAR), '-', CAST("weekWeek" AS VARCHAR))`,
    );
    await qr.query(`ALTER TABLE "game" DROP COLUMN "weekYear"`);
    await qr.query(`ALTER TABLE "game" DROP COLUMN "weekSeasontype"`);
    await qr.query(`ALTER TABLE "game" DROP COLUMN "weekWeek"`);

    // BetDoubler
    await qr.query(`ALTER TABLE "betDoubler" ADD "weekId" character varying`);
    await qr.query(
      `UPDATE "betDoubler" SET "weekId" = CONCAT(CAST("weekYear" AS VARCHAR), '-', CAST("weekSeasontype" AS VARCHAR), '-', CAST("weekWeek" AS VARCHAR))`,
    );
    await qr.query(`ALTER TABLE "betDoubler" DROP COLUMN "weekYear"`);
    await qr.query(`ALTER TABLE "betDoubler" DROP COLUMN "weekSeasontype"`);
    await qr.query(`ALTER TABLE "betDoubler" DROP COLUMN "weekWeek"`);

    // Week
    await qr.query(`ALTER TABLE "week" ADD "id" character varying`);
    await qr.query(
      `UPDATE "week" SET "id" = CONCAT(CAST("year" AS VARCHAR), '-', CAST("seasontype" AS VARCHAR), '-', CAST("week" AS VARCHAR))`,
    );
    await qr.query(`ALTER TABLE "week" ALTER COLUMN "id" SET NOT NULL`);

    // Add constraints
    await qr.query(
      `ALTER TABLE "week" ADD CONSTRAINT "PK_1f85dfadd5f363a1d0bce2b9664" PRIMARY KEY ("id")`,
    );
    await qr.query(
      `ALTER TABLE "week" ADD CONSTRAINT "UQ_960a28d375395804d5ce7a7a0f2" UNIQUE ("year", "seasontype", "week")`,
    );
    await qr.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "PK_a455633f8630887792176d19380" PRIMARY KEY ("id")`,
    );
    await qr.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "FK_64072cdad2912c04f305967a989" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await qr.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "FK_478aa45033037c58eda5d02e5c0" FOREIGN KEY ("weekId") REFERENCES "week"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await qr.query(
      `ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_d1e3ccd0aa94c2699caaff0b26b" FOREIGN KEY ("weekId") REFERENCES "week"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await qr.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_fa3503be7803a0d1b80a76e31c8" FOREIGN KEY ("weekId") REFERENCES "week"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(qr: QueryRunner): Promise<void> {
    await qr.query(
      `ALTER TABLE "game" DROP CONSTRAINT "FK_fa3503be7803a0d1b80a76e31c8"`,
    );
    await qr.query(
      `ALTER TABLE "betDoubler" DROP CONSTRAINT "FK_d1e3ccd0aa94c2699caaff0b26b"`,
    );
    await qr.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "FK_64072cdad2912c04f305967a989"`,
    );
    await qr.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "FK_478aa45033037c58eda5d02e5c0"`,
    );
    await qr.query(
      `ALTER TABLE "week" DROP CONSTRAINT "UQ_960a28d375395804d5ce7a7a0f2"`,
    );
    await qr.query(
      `ALTER TABLE "week" DROP CONSTRAINT "PK_1f85dfadd5f363a1d0bce2b9664"`,
    );
    await qr.query(
      `ALTER TABLE "bye" DROP CONSTRAINT "PK_a455633f8630887792176d19380"`,
    );
    await qr.query(`ALTER TABLE "game" ADD "weekWeek" integer`);
    await qr.query(`ALTER TABLE "game" ADD "weekSeasontype" integer`);
    await qr.query(`ALTER TABLE "game" ADD "weekYear" integer`);
    await qr.query(
      `UPDATE "game" SET "weekYear" = CAST(SPLIT_PART("weekId", '-', 1) AS integer);`,
    );
    await qr.query(
      `UPDATE "game" SET "weekSeasontype" = CAST(SPLIT_PART("weekId", '-', 2) AS integer);`,
    );
    await qr.query(
      `UPDATE "game" SET "weekWeek" = CAST(SPLIT_PART("weekId", '-', 3) AS integer);`,
    );
    await qr.query(`ALTER TABLE "game" DROP COLUMN "weekId"`);

    await qr.query(`ALTER TABLE "betDoubler" ADD "weekWeek" integer`);
    await qr.query(`ALTER TABLE "betDoubler" ADD "weekSeasontype" integer`);
    await qr.query(`ALTER TABLE "betDoubler" ADD "weekYear" integer`);
    await qr.query(
      `UPDATE "betDoubler" SET "weekYear" = CAST(SPLIT_PART("weekId", '-', 1) AS integer);`,
    );
    await qr.query(
      `UPDATE "betDoubler" SET "weekSeasontype" = CAST(SPLIT_PART("weekId", '-', 2) AS integer);`,
    );
    await qr.query(
      `UPDATE "betDoubler" SET "weekWeek" = CAST(SPLIT_PART("weekId", '-', 3) AS integer);`,
    );
    await qr.query(`ALTER TABLE "betDoubler" DROP COLUMN "weekId"`);

    await qr.query(`ALTER TABLE "bye" ADD "weekWeek" integer`);
    await qr.query(`ALTER TABLE "bye" ADD "weekSeasontype" integer`);
    await qr.query(`ALTER TABLE "bye" ADD "weekYear" integer`);
    await qr.query(
      `UPDATE "bye" SET "weekYear" = CAST(SPLIT_PART("weekId", '-', 1) AS integer);`,
    );
    await qr.query(
      `UPDATE "bye" SET "weekSeasontype" = CAST(SPLIT_PART("weekId", '-', 2) AS integer);`,
    );
    await qr.query(
      `UPDATE "bye" SET "weekWeek" = CAST(SPLIT_PART("weekId", '-', 3) AS integer);`,
    );
    await qr.query(`ALTER TABLE "bye" ALTER COLUMN "weekWeek" SET NOT NULL`);
    await qr.query(
      `ALTER TABLE "bye" ALTER COLUMN "weekSeasontype" SET NOT NULL`,
    );
    await qr.query(`ALTER TABLE "bye" ALTER COLUMN "weekYear" SET NOT NULL`);
    await qr.query(`ALTER TABLE "bye" DROP COLUMN "weekId"`);
    await qr.query(`ALTER TABLE "bye" DROP COLUMN "id"`);

    await qr.query(`ALTER TABLE "week" DROP COLUMN "id"`);

    await qr.query(
      `ALTER TABLE "week" ADD CONSTRAINT "PK_960a28d375395804d5ce7a7a0f2" PRIMARY KEY ("year", "seasontype", "week")`,
    );
    await qr.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "FK_64072cdad2912c04f305967a989" FOREIGN KEY ("teamId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await qr.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "PK_9b5d83c2c4a81d8045144b5fc68" PRIMARY KEY ("weekYear", "weekSeasontype", "weekWeek", "teamId")`,
    );
    await qr.query(
      `ALTER TABLE "game" ADD CONSTRAINT "FK_a18c608ef2def5a2ece613969bd" FOREIGN KEY ("weekYear", "weekSeasontype", "weekWeek") REFERENCES "week"("year","seasontype","week") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await qr.query(
      `ALTER TABLE "betDoubler" ADD CONSTRAINT "FK_505c5923144d707c91090a67970" FOREIGN KEY ("weekYear", "weekSeasontype", "weekWeek") REFERENCES "week"("year","seasontype","week") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await qr.query(
      `ALTER TABLE "bye" ADD CONSTRAINT "FK_e36b26bfb4b65a95eac5bdbdbba" FOREIGN KEY ("weekYear", "weekSeasontype", "weekWeek") REFERENCES "week"("year","seasontype","week") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
