import { MigrationInterface, QueryRunner } from 'typeorm';

export class UserDoesNotHavePermissions1643817927822
  implements MigrationInterface
{
  name = 'UserDoesNotHavePermissions1643817927822';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "permissions"`);
    await queryRunner.query(`DROP TYPE "public"."users_permissions_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_permissions_enum" AS ENUM('createUser', 'editUser', 'deleteUser', 'createOrganisation', 'deleteOrganisation', 'createProfession', 'deleteprofession', 'uploadDecisionData', 'downloadDecisionData', 'viewDecisionData')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "permissions" "public"."users_permissions_enum" array NOT NULL DEFAULT '{}'`,
    );
  }
}
