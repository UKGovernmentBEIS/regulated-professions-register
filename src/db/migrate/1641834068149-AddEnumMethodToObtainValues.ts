import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEnumMethodToObtainValues1641834068149
  implements MigrationInterface
{
  name = 'AddEnumMethodToObtainValues1641834068149';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."qualifications_methodtoobtain_enum" AS ENUM('generalSecondaryEducation', 'generalOrVocationalPostSecondaryEducation', 'generalPostSecondaryEducationMandatoryVocational', 'vocationalPostSecondaryEducation', 'degreeLevel', 'others')`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "methodToObtain" "public"."qualifications_methodtoobtain_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherMethodToObtain" character varying`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."qualifications_commonpathtoobtain_enum" AS ENUM('generalSecondaryEducation', 'generalOrVocationalPostSecondaryEducation', 'generalPostSecondaryEducationMandatoryVocational', 'vocationalPostSecondaryEducation', 'degreeLevel', 'others')`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "commonPathToObtain" "public"."qualifications_commonpathtoobtain_enum" NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ADD "otherCommonPathToObtain" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherCommonPathToObtain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "commonPathToObtain"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."qualifications_commonpathtoobtain_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "otherMethodToObtain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" DROP COLUMN "methodToObtain"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."qualifications_methodtoobtain_enum"`,
    );
  }
}
