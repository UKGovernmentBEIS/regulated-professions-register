import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrganisationAndProfessionRelationship1640263118080
  implements MigrationInterface
{
  name = 'AddOrganisationAndProfessionRelationship1640263118080';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" ADD "organisationId" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" ADD CONSTRAINT "FK_a1a8fd6782014089dbab4a5118f" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "professions" DROP CONSTRAINT "FK_a1a8fd6782014089dbab4a5118f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "professions" DROP COLUMN "organisationId"`,
    );
  }
}
