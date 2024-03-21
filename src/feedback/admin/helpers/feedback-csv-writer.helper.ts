import { Stringifier, stringify } from 'csv-stringify';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { Feedback } from '../../feedback.entity';

export class FeedbackCsvWriter {
  constructor(
    private readonly response: Response,
    private readonly filename: string,
    private readonly feedback: Feedback[],
    private readonly i18nService: I18nService,
  ) {}

  write(): void {
    const stringifier = stringify();

    this.response.set({
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${this.filename}.csv"`,
    });

    stringifier.pipe(this.response);

    this.writeHeadings(stringifier);

    this.feedback.forEach((f) => {
      stringifier.write([
        f.created_at.toLocaleString('en-GB'),
        f.feedbackOrTechnical,
        f.satisfaction,
        f.improvements,
        f.visitReason,
        f.visitReasonOther,
        f.contactAuthority,
        f.contactAuthorityNoReason,
        f.problemArea,
        f.problemAreaPage,
        f.problemDescription,
        f.betaSurveyYesNo,
        f.betaSurveyEmail,
      ]);
    });

    stringifier.end();
  }

  private writeHeadings(stringifier: Stringifier): void {
    stringifier.write(
      [
        'feedback.csv.heading.created',
        'feedback.csv.heading.feedbackOrTechnical',
        'feedback.csv.heading.satisfaction',
        'feedback.csv.heading.improvements',
        'feedback.csv.heading.visitReason',
        'feedback.csv.heading.visitReasonOther',
        'feedback.csv.heading.contactAuthority',
        'feedback.csv.heading.contactAuthorityNoReason',
        'feedback.csv.heading.problemArea',
        'feedback.csv.heading.problemAreaPage',
        'feedback.csv.heading.problemDescription',
        'feedback.csv.heading.betaSurveyYesNo',
        'feedback.csv.heading.betaSurveyEmail',
      ].map((id) => this.i18nService.translate<string>(id)),
    );
  }
}
