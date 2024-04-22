import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { FeedbackCsvWriter } from './helpers/feedback-csv-writer.helper';
import { Response } from 'express';
import * as getExportTimestampModule from './helpers/get-export-timestamp.helper';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from '../feedback.service';
import feedbackFactory from '../../testutils/factories/feedback';

jest.mock('./helpers/feedback-csv-writer.helper');

describe('FeedbackController', () => {
  let controller: FeedbackController;

  let feedbackService: DeepMocked<FeedbackService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    feedbackService = createMock<FeedbackService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: feedbackService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
  });

  describe('FeedbackController', () => {
    describe('index', () => {
      it('returns without error', () => {
        expect(controller.index()).toEqual(undefined);
      });
    });

    describe('export', () => {
      describe('when called', () => {
        it('exports a CSV file of all feedback', async () => {
          const response = createMock<Response>();

          const getExportTimestampSpy = jest
            .spyOn(getExportTimestampModule, 'getExportTimestamp')
            .mockReturnValue('20240525-130526');

          const feedback = feedbackFactory.buildList(3);

          feedbackService.all.mockResolvedValue(feedback);

          await controller.export(response);

          expect(getExportTimestampSpy).toHaveBeenCalled();

          expect(FeedbackCsvWriter).toHaveBeenCalledWith(
            response,
            'feedback-20240525-130526',
            feedback,
            i18nService,
          );
          expect(FeedbackCsvWriter.prototype.write).toHaveBeenCalled();
          expect(feedbackService.all).toHaveBeenCalled();
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
