import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveDeprecatedQualificationFields1645440083160
  implements MigrationInterface
{
  name = 'RemoveDeprecatedQualificationFields1645440083160';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "methodToObtainDeprecated"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."qualifications_methodtoobtaindeprecated_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "commonPathToObtainDeprecated"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."qualifications_commonpathtoobtaindeprecated_enum"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."qualifications_commonpathtoobtaindeprecated_enum" AS ENUM('generalSecondaryEducation', 'generalOrVocationalPostSecondaryEducation', 'generalPostSecondaryEducationMandatoryVocational', 'vocationalPostSecondaryEducation', 'degreeLevel', 'others')`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "commonPathToObtainDeprecated" "public"."qualifications_commonpathtoobtaindeprecated_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."qualifications_methodtoobtaindeprecated_enum" AS ENUM('generalSecondaryEducation', 'generalOrVocationalPostSecondaryEducation', 'generalPostSecondaryEducationMandatoryVocational', 'vocationalPostSecondaryEducation', 'degreeLevel', 'others')`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "methodToObtainDeprecated" "public"."qualifications_methodtoobtaindeprecated_enum"`,
    );
  }
}
