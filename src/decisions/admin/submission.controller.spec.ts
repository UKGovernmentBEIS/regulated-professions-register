import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { translationOf } from '../../testutils/translation-of';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { SubmissionController } from './submission.controller';

jest.mock('../../common/flash-message');

describe('SubmissionController', () => {
  let controller: SubmissionController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubmissionController],
      providers: [
        {
          provide: DecisionDatasetsService,
          useValue: decisionDatasetsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<SubmissionController>(SubmissionController);
  });

  describe('create', () => {
    it('submits the given dataset', async () => {
      const response = createMock<Response>();
      const request = createMock<Request>();

      const flashMock = flashMessage as jest.Mock;
      flashMock.mockImplementation(() => 'STUB_FLASH_MESSAGE');

      const profession = professionFactory.build({
        id: 'example-profession-id',
      });

      const organisation = organisationFactory.build({
        id: 'example-organisation-id',
      });

      const dataset = decisionDatasetFactory.build({
        profession,
        organisation,
        year: 2016,
      });

      await controller.create(
        'example-profession-id',
        'example-organisation-id',
        2016,
        response,
        request,
      );

      expect(decisionDatasetsService.find).toHaveBeenCalledWith(
        'example-profession-id',
        'example-organisation-id',
        2016,
      );

      expect(decisionDatasetsService.submit).toHaveBeenCalledWith(dataset);

      expect(flashMock).toHaveBeenCalledWith(
        translationOf('decisions.admin.submission.confirmation.heading'),
        translationOf('decisions.admin.submission.confirmation.body'),
      );

      expect(response.redirect).toHaveBeenCalledWith(
        '/admin/decisions/example-profession-id/example-organisation-id/2016',
      );
    });
  });
});
