import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChangeRolesToPermissions1640274620476
  implements MigrationInterface
{
  name = 'ChangeRolesToPermissions1640274620476';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE users SET roles = '{}' WHERE 1=1`);
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "roles" TO "permissions"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_roles_enum" RENAME TO "users_permissions_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_permissions_enum" RENAME TO "users_permissions_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_permissions_enum" AS ENUM('createUser', 'editUser', 'deleteUser', 'createOrganisation', 'deleteOrganisation', 'createProfession', 'deleteprofession', 'uploadDecisionData', 'downloadDecisionData', 'viewDecisionData')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "permissions" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "permissions" TYPE "public"."users_permissions_enum"[] USING "permissions"::"text"::"public"."users_permissions_enum"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "permissions" SET DEFAULT '{}'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_permissions_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_permissions_enum_old" AS ENUM('admin', 'editor')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "permissions" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "permissions" TYPE "public"."users_permissions_enum_old"[] USING "permissions"::"text"::"public"."users_permissions_enum_old"[]`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "permissions" SET DEFAULT '{}'`,
    );
    await queryRunner.query(`DROP TYPE "public"."users_permissions_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."users_permissions_enum_old" RENAME TO "users_permissions_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."users_permissions_enum" RENAME TO "users_roles_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" RENAME COLUMN "permissions" TO "roles"`,
    );
  }
}
