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
  let profession: DeepMocked<Profession>;

  const healthIndustry = new Industry('industries.health');
  healthIndustry.id = 'health-uuid';
  const constructionIndustry = new Industry(
    'industries.constructionAndEngineering',
  );
  constructionIndustry.id = 'construction-uuid';

  const industries = [healthIndustry, constructionIndustry];

  beforeEach(async () => {
    profession = createMock<Profession>({
      id: 'profession-id',
    });

    industriesService = createMock<IndustriesService>();
    professionsService = createMock<ProfessionsService>({
      find: async () => profession,
    });

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

  describe('edit', () => {
    it('should fetch all Industries and Nations to be displayed in an option select', async () => {
      const templateArgs = await controller.edit('profession-id');

      expect(templateArgs).toEqual({
        professionId: 'profession-id',
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
        errors: undefined,
      });
      expect(industriesService.all).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the Check your answers page', async () => {
        const topLevelDetailsDto = {
          name: 'Gas Safe Engineer',
          nations: ['GB-ENG'],
          industries: ['construction-uuid'],
        };

        industriesService.findByIds.mockResolvedValue(industries);

        await controller.update(topLevelDetailsDto, response, 'profession-id');

        expect(professionsService.save).toHaveBeenCalledWith({
          id: 'profession-id',
          name: 'Gas Safe Engineer',
          occupationLocations: ['GB-ENG'],
          industries,
        });

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/check-your-answers',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not create a profession, and re-renders the top level information view with errors', async () => {
        const topLevelDetailsDtoWithNoAnswers = {
          name: '',
          nations: undefined,
          industries: undefined,
        };

        await controller.update(
          topLevelDetailsDtoWithNoAnswers,
          response,
          'profession-id',
        );

        expect(professionsService.save).not.toHaveBeenCalled();

        expect(industriesService.all).toHaveBeenCalled();
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
