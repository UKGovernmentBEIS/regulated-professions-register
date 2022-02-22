import { MigrationInterface, QueryRunner } from 'typeorm';

export class DeprecateMethodsToObtainQualification1645193098485
  implements MigrationInterface
{
  name = 'DeprecateMethodsToObtainQualification1645193098485';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "methodToObtain" TO "methodToObtainDeprecated"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."qualifications_methodtoobtain_enum" RENAME TO "qualifications_methodtoobtaindeprecated_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "commonPathToObtain" TO "commonPathToObtainDeprecated"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."qualifications_commonpathtoobtain_enum" RENAME TO "qualifications_commonpathtoobtaindeprecated_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."qualifications_commonpathtoobtaindeprecated_enum" RENAME TO "qualifications_commonpathtoobtain_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "commonPathToObtainDeprecated" TO "commonPathToObtain"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."qualifications_methodtoobtaindeprecated_enum" RENAME TO "qualifications_methodtoobtain_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "methodToObtainDeprecated" TO "methodToObtain"`,
    );
  }
}
