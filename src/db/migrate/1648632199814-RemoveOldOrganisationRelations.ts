import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveOldOrganisationRelations1648632199814
  implements MigrationInterface
{
  name = 'RemoveOldOrganisationRelations1648632199814';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_a1a8fd6782014089dbab4a5118f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_86e53b1b0a4604ede6ba4f743c5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "organisationId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "additionalOrganisationId"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "additionalOrganisationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "organisationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_86e53b1b0a4604ede6ba4f743c5" FOREIGN KEY ("additionalOrganisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_a1a8fd6782014089dbab4a5118f" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
