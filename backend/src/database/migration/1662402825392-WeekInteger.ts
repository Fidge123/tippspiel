import { MigrationInterface, QueryRunner } from "typeorm";

export class WeekInteger1662402825392 implements MigrationInterface {
    name = 'WeekInteger1662402825392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_b0ff088e334067e8daf4c5e14eb"`);
        await queryRunner.query(`ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_897c55ab90c7a9710873b8239b2" FOREIGN KEY ("firstId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_897c55ab90c7a9710873b8239b2"`);
        await queryRunner.query(`ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_b0ff088e334067e8daf4c5e14eb" FOREIGN KEY ("firstId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
