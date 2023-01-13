import { MigrationInterface, QueryRunner } from "typeorm";

export class Indices21673625077228 implements MigrationInterface {
    name = 'Indices21673625077228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "week" DROP CONSTRAINT "UQ_960a28d375395804d5ce7a7a0f2"`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_960a28d375395804d5ce7a7a0f" ON "week" ("year", "seasontype", "week") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_960a28d375395804d5ce7a7a0f"`);
        await queryRunner.query(`ALTER TABLE "week" ADD CONSTRAINT "UQ_960a28d375395804d5ce7a7a0f2" UNIQUE ("year", "seasontype", "week")`);
    }

}
