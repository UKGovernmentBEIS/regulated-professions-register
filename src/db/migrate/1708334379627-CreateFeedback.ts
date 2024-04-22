import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFeedback1708334379627 implements MigrationInterface {
  name = 'CreateFeedback1708334379627';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "feedbackOrTechnical" character varying NOT NULL, "satisfaction" character varying, "improvements" text, "visitReason" character varying, "visitReasonOther" text, "contactAuthority" character varying, "contactAuthorityNoReason" text, "problemArea" character varying, "problemAreaPage" text, "problemDescription" text, "betaSurveyYesNo" character varying, "betaSurveyEmail" text, "created_at" TIMESTAMP NOT NULL DEFAULT ('now'::text)::timestamp(6) with time zone, CONSTRAINT "PK_8389f9e087a57689cd5be8b2b13" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "feedback"`);
  }
}
