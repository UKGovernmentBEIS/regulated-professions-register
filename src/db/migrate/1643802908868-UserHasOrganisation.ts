import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserHasOrganisation1643802908868 implements MigrationInterface {
  name = 'UserHasOrganisation1643802908868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "organisationId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "FK_4bba96961e0142c06aa921ce27f" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "FK_4bba96961e0142c06aa921ce27f"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "organisationId"`);
  }
}
