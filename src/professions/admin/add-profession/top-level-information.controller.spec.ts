import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { IndustriesService } from '../../../industries/industries.service';
import { Industry } from '../../../industries/industry.entity';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { TopLevelInformationController } from './top-level-information.controller';

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let professionsService: DeepMocked<ProfessionsService>;
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
    professionsService = createMock<ProfessionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [
        { provide: IndustriesService, useValue: industriesService },
        { provide: ProfessionsService, useValue: professionsService },
      ],
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
              text: 'nations.scotland',
              value: 'GB-SCT',
            },
            {
              text: 'nations.wales',
              value: 'GB-WLS',
            },
            {
              text: 'nations.northernIreland',
              value: 'GB-NIR',
            },
          ],
        },
      );
      expect(industriesService.all).toHaveBeenCalled();
    });
  });

  describe('addTopLevelInformation', () => {
    describe('when all required parameters are entered', () => {
      it('creates a new, draft, Profession, stores its id in the session and redirects to the Check your answers page', async () => {
        const emptySession = {};

        const topLevelDetails = {
          name: 'Gas Safe Engineer',
          nations: ['GB-ENG'],
          industries: ['construction-uuid'],
        };

        const draftProfession = new Profession(
          'Gas Safe Engineer',
          null,
          null,
          null,
          ['GB-ENG'],
          null,
          industries,
        );

        const createdProfession = { ...draftProfession };
        createdProfession.id = 'profession-id';

        professionsService.confirm.mockResolvedValue(createdProfession);
        industriesService.findByIds.mockResolvedValue(industries);

        await controller.addTopLevelInformation(
          emptySession,
          topLevelDetails,
          response,
        );

        expect(professionsService.confirm).toHaveBeenCalledWith(
          draftProfession,
        );
        expect(emptySession['draft-profession-id']).toEqual('profession-id');
        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/new/check-your-answers',
        );
      });
    });

    describe('when a required parameter is not entered', () => {
      it('does not create a profession, and re-renders the top level information view with errors', async () => {
        const emptySession = {};

        const topLevelDetailsWithNoAnswers = {
          name: '',
          nations: undefined,
          industries: undefined,
        };

        await controller.addTopLevelInformation(
          emptySession,
          topLevelDetailsWithNoAnswers,
          response,
        );

        expect(professionsService.confirm).not.toHaveBeenCalled();

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
                text: 'nations.scotland',
                value: 'GB-SCT',
              },
              {
                text: 'nations.wales',
                value: 'GB-WLS',
              },
              {
                text: 'nations.northernIreland',
                value: 'GB-NIR',
              },
            ],
            errors: {
              name: { text: 'name should not be empty' },
              nations: { text: 'nations should not be empty' },
              industries: { text: 'industries should not be empty' },
            },
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
