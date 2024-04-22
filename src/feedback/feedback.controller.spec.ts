import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { Response } from 'express';
import feedbackFactory from '../testutils/factories/feedback';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { Feedback } from './feedback.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createDefaultMockRequest } from '../testutils/factories/create-default-mock-request';

describe('FeedbackController', () => {
  let feedbackController: FeedbackController;
  let feedbackService: DeepMocked<FeedbackService>;
  let repo: Repository<Feedback>;

  beforeEach(async () => {
    const i18nService = createMockI18nService();
    feedbackService = createMock<FeedbackService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [
        {
          provide: FeedbackService,
          useValue: feedbackService,
        },
        {
          provide: getRepositoryToken(Feedback),
          useValue: createMock<Repository<Feedback>>(),
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    repo = module.get<Repository<Feedback>>(getRepositoryToken(Feedback));

    feedbackController = module.get<FeedbackController>(FeedbackController);
  });

  describe('new', () => {
    describe('When all required fields are provided', () => {
      it('saves a new feedback item', async () => {
        const feedback = feedbackFactory.build();
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await feedbackController.update(request, response, feedback);

        expect(feedbackService.save).toHaveBeenCalledWith(feedback);
      });
    });

    describe('When a required field is missing', () => {
      it('does not save', async () => {
        const feedback = feedbackFactory.build({
          feedbackOrTechnical: '',
        });
        const request = createDefaultMockRequest();
        const response = createMock<Response>();

        await feedbackController.update(request, response, feedback);

        expect(feedbackService.save).not.toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
});
