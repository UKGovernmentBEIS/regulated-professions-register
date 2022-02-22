import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUrlToQualification1645440934823 implements MigrationInterface {
  name = 'AddUrlToQualification1645440934823';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "url" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "qualifications" DROP COLUMN "url"`);
  }
}
