import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import decisionDatasetFactory from '../../testutils/factories/decision-dataset';
import organisationFactory from '../../testutils/factories/organisation';
import professionFactory from '../../testutils/factories/profession';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { PublicationController } from './publication.controller';

describe('PublicationController', () => {
  let controller: PublicationController;

  let decisionDatasetsService: DeepMocked<DecisionDatasetsService>;

  beforeEach(async () => {
    decisionDatasetsService = createMock<DecisionDatasetsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicationController],
      providers: [
        {
          provide: DecisionDatasetsService,
          useValue: decisionDatasetsService,
        },
      ],
    }).compile();

    controller = module.get<PublicationController>(PublicationController);
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
