import { MigrationInterface, QueryRunner } from 'typeorm';

export class deprecateMethodToObtainValues1641833300694
  implements MigrationInterface
{
  name = 'deprecateMethodToObtainValues1641833300694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "methodToObtain" TO "methodToObtainDeprecated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "methodToObtainDeprecated" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "commonPathToObtain" TO "commonPathToObtainDeprecated"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "commonPathToObtainDeprecated" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "commonPathToObtainDeprecated" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "commonPathToObtainDeprecated" TO "commonPathToObtain"`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" ALTER COLUMN "methodToObtainDeprecated" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "qualifications" RENAME COLUMN "methodToObtainDeprecated" TO "methodToObtain"`,
    );
  }
}
