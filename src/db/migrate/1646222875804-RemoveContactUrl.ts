import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveContactUrl1646222875804 implements MigrationInterface {
  name = 'RemoveContactUrl1646222875804';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "contactUrl"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "contactUrl" character varying`,
    );
  }
}
