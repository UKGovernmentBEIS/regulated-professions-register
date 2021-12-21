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
      industries: null,
      occupationLocations: null,
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
    describe('when editing a just-created, blank Profession', () => {
      const blankProfession = new Profession();
      blankProfession.id = 'profession-id';

      it('should fetch all Industries and Nations to be displayed in an option select, with none of them checked', async () => {
        professionsService.find.mockImplementation(async () => blankProfession);

        const templateArgs = await controller.edit('profession-id');

        expect(templateArgs).toEqual({
          name: null,
          industriesCheckboxArgs: [
            {
              text: 'industries.health',
              value: 'health-uuid',
              checked: false,
            },
            {
              text: 'industries.constructionAndEngineering',
              value: 'construction-uuid',
              checked: false,
            },
          ],
          nationsCheckboxArgs: [
            {
              text: 'nations.england',
              value: 'GB-ENG',
              checked: false,
            },
            {
              text: 'nations.scotland',
              value: 'GB-SCT',
              checked: false,
            },
            {
              text: 'nations.wales',
              value: 'GB-WLS',
              checked: false,
            },
            {
              text: 'nations.northernIreland',
              value: 'GB-NIR',
              checked: false,
            },
          ],
          errors: undefined,
        });
        expect(industriesService.all).toHaveBeenCalled();
      });
    });

    describe('when an existing Profession is found', () => {
      const selectedIndustry = new Industry('industries.health');
      selectedIndustry.id = 'health-uuid';

      const existingProfession = new Profession(
        'Example Profession',
        null,
        null,
        null,
        ['GB-ENG', 'GB-SCT'],
        null,
        [selectedIndustry],
      );
      existingProfession.id = 'profession-id';

      it('should pre-fill the Profession name and pre-select checkboxes for selected Nations and Industries', async () => {
        professionsService.find.mockImplementation(
          async () => existingProfession,
        );

        const templateArgs = await controller.edit('profession-id');

        expect(templateArgs).toEqual({
          name: 'Example Profession',
          industriesCheckboxArgs: [
            {
              text: 'industries.health',
              value: 'health-uuid',
              checked: true,
            },
            {
              text: 'industries.constructionAndEngineering',
              value: 'construction-uuid',
              checked: false,
            },
          ],
          nationsCheckboxArgs: [
            {
              text: 'nations.england',
              value: 'GB-ENG',
              checked: true,
            },
            {
              text: 'nations.scotland',
              value: 'GB-SCT',
              checked: true,
            },
            {
              text: 'nations.wales',
              value: 'GB-WLS',
              checked: false,
            },
            {
              text: 'nations.northernIreland',
              value: 'GB-NIR',
              checked: false,
            },
          ],
          errors: undefined,
        });
        expect(industriesService.all).toHaveBeenCalled();
      });
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
