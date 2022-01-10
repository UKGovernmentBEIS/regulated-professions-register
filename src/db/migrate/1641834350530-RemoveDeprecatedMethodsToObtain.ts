import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDeprecatedMethodsToObtain1641834350530
  implements MigrationInterface
{
  name = 'RemoveDeprecatedMethodsToObtain1641834350530';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "methodToObtainDeprecated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "commonPathToObtainDeprecated"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "commonPathToObtainDeprecated" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "methodToObtainDeprecated" character varying`,
    );
  }
}
