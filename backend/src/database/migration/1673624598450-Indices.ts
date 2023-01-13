import { MigrationInterface, QueryRunner } from "typeorm";

export class Indices1673624598450 implements MigrationInterface {
    name = 'Indices1673624598450'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bye" DROP CONSTRAINT "FK_478aa45033037c58eda5d02e5c0"`);
        await queryRunner.query(`ALTER TABLE "bye" ALTER COLUMN "weekId" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_321447fccd6338ee2776aa9936" ON "divisionBet" ("divisionName", "userId", "leagueId", "year") `);
        await queryRunner.query(`CREATE INDEX "IDX_23a1f21c2ca2a0b6797564d2b4" ON "bet" ("userId") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_fe022bce1d0feba556dc3c6721" ON "bet" ("gameId", "userId", "leagueId") `);
        await queryRunner.query(`CREATE INDEX "IDX_585dc8593e1c01b0f5e78477cf" ON "game" ("date") `);
        await queryRunner.query(`CREATE INDEX "IDX_1f2f5fed6227e9266b8e6f4040" ON "game" ("status") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e3018c27fdac8174ca49115411" ON "betDoubler" ("weekId", "userId", "leagueId") `);
        await queryRunner.query(`ALTER TABLE "bye" ADD CONSTRAINT "FK_478aa45033037c58eda5d02e5c0" FOREIGN KEY ("weekId") REFERENCES "week"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bye" DROP CONSTRAINT "FK_478aa45033037c58eda5d02e5c0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e3018c27fdac8174ca49115411"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1f2f5fed6227e9266b8e6f4040"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_585dc8593e1c01b0f5e78477cf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fe022bce1d0feba556dc3c6721"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_23a1f21c2ca2a0b6797564d2b4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_321447fccd6338ee2776aa9936"`);
        await queryRunner.query(`ALTER TABLE "bye" ALTER COLUMN "weekId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "bye" ADD CONSTRAINT "FK_478aa45033037c58eda5d02e5c0" FOREIGN KEY ("weekId") REFERENCES "week"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
