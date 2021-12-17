import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimestampsToEntities1639655762299
  implements MigrationInterface
{
  name = 'AddTimestampsToEntities1639655762299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "industries" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "industries" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "organisations" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "organisations" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "legislations" DROP COLUMN "created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "industries" DROP COLUMN "updated_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "industries" DROP COLUMN "created_at"`,
    );
  }
}
