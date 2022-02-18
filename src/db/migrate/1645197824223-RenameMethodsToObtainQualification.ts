import { MigrationInterface, QueryRunner } from 'typeorm';

export class RenameMethodsToObtainQualification1645197824223
  implements MigrationInterface
{
  name = 'RenameMethodsToObtainQualification1645197824223';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "otherMethodToObtain" TO "routesToObtain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "otherCommonPathToObtain" TO "mostCommonRouteToObtain"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "mostCommonRouteToObtain" TO "otherCommonPathToObtain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "routesToObtain" TO "otherMethodToObtain"`,
    );
  }
}
