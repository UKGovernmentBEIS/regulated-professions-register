import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { flashMessage } from '../../common/flash-message';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionsService } from '../../professions/professions.service';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { translationOf } from '../../testutils/translation-of';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { PublicationController } from './publication.controller';

jest.mock('../../common/flash-message');

describe('PublicationController', () => {
  let controller: PublicationController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicationController],
      providers: [
        {
          provide: DecisionDatasetsService,
          useValue: decisionDatasetsService,
        },
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
        {
          provide: OrganisationsService,
          useValue: organisationsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    controller = module.get<PublicationController>(PublicationController);
  });

  describe('new', () => {
    it('passes dataset details to a confirmation screen', async () => {
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

      professionsService.findWithVersions.mockResolvedValue(profession);
      organisationsService.find.mockResolvedValue(organisation);
      decisionDatasetsService.find.mockResolvedValue(dataset);

      expect(
        await controller.new(
          'example-profession-id',
          'example-organisation-id',
          2016,
        ),
      ).toEqual({
        profession,
        organisation,
        year: 2016,
      });

      expect(decisionDatasetsService.find).toHaveBeenCalledWith(
        'example-profession-id',
        'example-organisation-id',
        2016,
      );
    });
  });

  describe('create', () => {
    describe('when the user is a service owner', () => {
      it('saves the given dataset with the published status', async () => {
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

        decisionDatasetsService.find.mockResolvedValue(dataset);

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

        expect(decisionDatasetsService.publish).toHaveBeenCalledWith(dataset);

        expect(flashMock).toHaveBeenCalledWith(
          translationOf('decisions.admin.publication.confirmation.heading'),
          translationOf('decisions.admin.publication.confirmation.body'),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/decisions/example-profession-id/example-organisation-id/2016',
        );
      });
    });
  });
});
