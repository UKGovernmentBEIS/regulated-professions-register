import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRolesToUsers1638445843562 implements MigrationInterface {
  name = 'AddRolesToUsers1638445843562';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_roles_enum" AS ENUM('admin', 'editor')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "roles" "public"."users_roles_enum" array NOT NULL DEFAULT '{}'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    await queryRunner.query(`DROP TYPE "public"."users_roles_enum"`);
  }
}
