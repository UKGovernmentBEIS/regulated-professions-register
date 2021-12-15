import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { TopLevelInformationController } from './top-level-information.controller';

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let industriesService: DeepMocked<IndustriesService>;
  let response: DeepMocked<Response>;

  const healthIndustry = new Industry('industries.health');
  healthIndustry.id = 'health-uuid';
  const constructionIndustry = new Industry(
    'industries.constructionAndEngineering',
  );
  constructionIndustry.id = 'construction-uuid';

  const industries = [healthIndustry, constructionIndustry];

  beforeEach(async () => {
    industriesService = createMock<IndustriesService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [{ provide: IndustriesService, useValue: industriesService }],
    }).compile();

    industriesService.all.mockImplementation(async () => industries);
    response = createMock<Response>();

    controller = module.get<TopLevelInformationController>(
      TopLevelInformationController,
    );
  });

  describe('new', () => {
    it('should fetch all Industries and Nations to be displayed in an option select', async () => {
      await controller.new(response);

      expect(response.render).toHaveBeenCalledWith(
        'professions/admin/add-profession/top-level-information',
        {
          industriesCheckboxArgs: [
            {
              text: 'industries.health',
              value: 'health-uuid',
            },
            {
              text: 'industries.constructionAndEngineering',
              value: 'construction-uuid',
            },
          ],
          nationsCheckboxArgs: [
            {
              text: 'nations.england',
              value: 'GB-ENG',
            },
            {
              text: 'nations.northernIreland',
              value: 'GB-NIR',
            },
            {
              text: 'nations.scotland',
              value: 'GB-SCT',
            },
            {
              text: 'nations.wales',
              value: 'GB-WLS',
            },
          ],
        },
      );
      expect(industriesService.all).toHaveBeenCalled();
    });
  });

  describe('addTopLevelInformation', () => {
    describe('when all required parameters are entered', () => {
      it('redirects to the Check your answers page and stores top level information data in the session', async () => {
        const session = {
          'add-profession': {},
        };

        const topLevelDetails = {
          name: 'Gas Safe Engineer',
          nations: ['GB-ENG'],
          industries: ['construction-uuid'],
        };

        await controller.addTopLevelInformation(
          session,
          topLevelDetails,
          response,
        );

        expect(session).toEqual({
          'add-profession': {
            'top-level-details': {
              name: 'Gas Safe Engineer',
              nations: ['GB-ENG'],
              industries: ['construction-uuid'],
            },
          },
        });
        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/new/check-your-answers',
        );
      });
    });

    describe('when a required parameter is not entered', () => {
      it('renders the top level information view and displays an error to the user', async () => {
        const session = {
          'add-profession': {},
        };

        const topLevelDetailsWithMissingName = {
          name: '',
          nations: ['GB-ENG'],
          industries: ['construction-uuid'],
        };

        await controller.addTopLevelInformation(
          session,
          topLevelDetailsWithMissingName,
          response,
        );

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/top-level-information',
          {
            industriesCheckboxArgs: [
              {
                text: 'industries.health',
                value: 'health-uuid',
              },
              {
                text: 'industries.constructionAndEngineering',
                value: 'construction-uuid',
              },
            ],
            nationsCheckboxArgs: [
              {
                text: 'nations.england',
                value: 'GB-ENG',
              },
              {
                text: 'nations.northernIreland',
                value: 'GB-NIR',
              },
              {
                text: 'nations.scotland',
                value: 'GB-SCT',
              },
              {
                text: 'nations.wales',
                value: 'GB-WLS',
              },
            ],
            errors: { name: { text: 'name should not be empty' } },
          },
        );
        expect(industriesService.all).toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
