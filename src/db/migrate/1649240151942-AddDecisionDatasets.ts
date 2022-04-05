import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDecisionDatasets1649240151942 implements MigrationInterface {
  name = 'AddDecisionDatasets1649240151942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."decision-datasets_status_enum" AS ENUM('unconfirmed', 'draft', 'live')`,
    );
    await queryRunner.query(
      `CREATE TABLE "decision-datasets" ("year" integer NOT NULL, "status" "public"."decision-datasets_status_enum" NOT NULL DEFAULT 'unconfirmed', "routes" json NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "updated_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, "professionId" uuid NOT NULL, "organisationId" uuid NOT NULL, "userId" uuid, CONSTRAINT "PK_52b9c4a5cfecd8d853d7e1ae902" PRIMARY KEY ("year", "professionId", "organisationId"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ADD CONSTRAINT "FK_ccc22054f240b133cfc06226f87" FOREIGN KEY ("professionId") REFERENCES "professions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ADD CONSTRAINT "FK_c2450cdc2a55577234b83a4a77b" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" ADD CONSTRAINT "FK_8217bacac8244f74aef9d1899a7" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" DROP CONSTRAINT "FK_8217bacac8244f74aef9d1899a7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" DROP CONSTRAINT "FK_c2450cdc2a55577234b83a4a77b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "decision-datasets" DROP CONSTRAINT "FK_ccc22054f240b133cfc06226f87"`,
    );
    await queryRunner.query(`DROP TABLE "decision-datasets"`);
    await queryRunner.query(
      `DROP TYPE "public"."decision-datasets_status_enum"`,
    );
  }
}
