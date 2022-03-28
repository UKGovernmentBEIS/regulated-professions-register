import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveFax1648476475108 implements MigrationInterface {
  name = 'RemoveFax1648476475108';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" DROP COLUMN "fax"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "organisationVersions" ADD "fax" character varying`,
    );
  }
}
