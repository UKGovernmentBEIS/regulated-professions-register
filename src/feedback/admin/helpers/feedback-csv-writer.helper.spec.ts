import { createMock } from '@golevelup/ts-jest';
import * as stringifyModule from 'csv-stringify';
import { Response } from 'express';
import { createMockI18nService } from '../../../testutils/create-mock-i18n-service';
import feedbackFactory from '../../../testutils/factories/feedback';
import { translationOf } from '../../../testutils/translation-of';
import { FeedbackCsvWriter } from './feedback-csv-writer.helper';

describe('FeedbackCsvWriter', () => {
  describe('write', () => {
    it('writes a CSV file of the given datasets', () => {
      const stringifierMock = createMock<stringifyModule.Stringifier>();
      const stringifySpy = jest
        .spyOn(stringifyModule, 'stringify')
        .mockReturnValue(stringifierMock);

      const response = createMock<Response>();

      const datasets = [
        feedbackFactory.build({
          satisfaction: 'Dissatisfied',
          improvements: 'Some suggested improvements to the site',
          betaSurveyYesNo: 'Yes',
          betaSurveyEmail: 'dissatisfied@example.com',
          created_at: new Date(2024, 6, 15),
        }),
        feedbackFactory.technicalProblem(1).build({
          created_at: new Date(2024, 6, 15),
        }),
      ];

      const writer = new FeedbackCsvWriter(
        response,
        'example-filename',
        datasets,
        createMockI18nService(),
      );

      writer.write();

      expect(response.set).toHaveBeenCalledWith({
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="example-filename.csv"`,
      });

      expect(stringifySpy).toHaveBeenCalled();

      expect(stringifierMock.write).toHaveBeenCalledTimes(3);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(1, [
        translationOf('feedback.csv.heading.created'),
        translationOf('feedback.csv.heading.feedbackOrTechnical'),
        translationOf('feedback.csv.heading.satisfaction'),
        translationOf('feedback.csv.heading.improvements'),
        translationOf('feedback.csv.heading.visitReason'),
        translationOf('feedback.csv.heading.visitReasonOther'),
        translationOf('feedback.csv.heading.contactAuthority'),
        translationOf('feedback.csv.heading.contactAuthorityNoReason'),
        translationOf('feedback.csv.heading.problemArea'),
        translationOf('feedback.csv.heading.problemAreaPage'),
        translationOf('feedback.csv.heading.problemDescription'),
        translationOf('feedback.csv.heading.betaSurveyYesNo'),
        translationOf('feedback.csv.heading.betaSurveyEmail'),
      ]);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(2, [
        '15/07/2024, 00:00:00',
        "No, I'd like to leave feedback about the service",
        'Dissatisfied',
        'Some suggested improvements to the site',
        'Get contact details for a regulatory authority',
        '',
        'Yes, I contacted them by phone or email',
        '',
        '',
        '',
        '',
        'Yes',
        'dissatisfied@example.com',
      ]);

      expect(stringifierMock.write).toHaveBeenNthCalledWith(3, [
        '15/07/2024, 00:00:00',
        "Yes, I'd like to report a technical problem",
        '',
        '',
        '',
        '',
        '',
        '',
        'The whole site',
        '',
        'Lorem ipsum',
        '',
        '',
      ]);

      expect(stringifierMock.pipe).toHaveBeenCalledWith(response);
      expect(stringifierMock.end).toHaveBeenCalled();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
