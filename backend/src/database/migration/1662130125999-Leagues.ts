import { MigrationInterface, QueryRunner } from "typeorm";

export class Leagues1662130125999 implements MigrationInterface {
    name = 'Leagues1662130125999'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "league" ADD "name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "league" ADD "season" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "season"`);
        await queryRunner.query(`ALTER TABLE "league" DROP COLUMN "name"`);
    }

}
