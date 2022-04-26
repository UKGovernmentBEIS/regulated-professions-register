import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionsService } from '../../professions/professions.service';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { PublicationController } from './publication.controller';

describe('PublicationController', () => {
  let controller: PublicationController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;
  let professionsService: DeepMocked<ProfessionsService>;
  let organisationsService: DeepMocked<OrganisationsService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();
    professionsService = createMock<ProfessionsService>();
    organisationsService = createMock<OrganisationsService>();

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
        );

        expect(decisionDatasetsService.find).toHaveBeenCalledWith(
          'example-profession-id',
          'example-organisation-id',
          2016,
        );

        expect(decisionDatasetsService.publish).toHaveBeenCalledWith(dataset);
        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/decisions/example-profession-id/example-organisation-id/2016',
        );
      });
    });
  });
});
