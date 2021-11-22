import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLegislation1637592030484 implements MigrationInterface {
  name = 'CreateLegislation1637592030484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "legislations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "url" character varying NOT NULL, CONSTRAINT "PK_5d841e6025c1524c71a06b3d624" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "legislations"`);
  }
}
