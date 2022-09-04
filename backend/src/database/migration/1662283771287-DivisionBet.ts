import { MigrationInterface, QueryRunner } from 'typeorm';

export class DivisionBet1662283771287 implements MigrationInterface {
  name = 'DivisionBet1662283771287';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "divisionBet" RENAME COLUMN "teamId" TO "firstId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD "secondId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD "thirdId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD "fourthId" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_03c3e8cb0af3416d31fcee760a8" FOREIGN KEY ("secondId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_eebc9b1703cccd6792abde4a548" FOREIGN KEY ("thirdId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" ADD CONSTRAINT "FK_016828005f3c492f9634962cbde" FOREIGN KEY ("fourthId") REFERENCES "team"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_016828005f3c492f9634962cbde"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_eebc9b1703cccd6792abde4a548"`,
    );
    await queryRunner.query(
      `ALTER TABLE "divisionBet" DROP CONSTRAINT "FK_03c3e8cb0af3416d31fcee760a8"`,
    );
    await queryRunner.query(`ALTER TABLE "divisionBet" DROP COLUMN "fourthId"`);
    await queryRunner.query(`ALTER TABLE "divisionBet" DROP COLUMN "thirdId"`);
    await queryRunner.query(`ALTER TABLE "divisionBet" DROP COLUMN "secondId"`);
    await queryRunner.query(
      `ALTER TABLE "divisionBet" RENAME COLUMN "firstId" TO "teamId"`,
    );
  }
}
