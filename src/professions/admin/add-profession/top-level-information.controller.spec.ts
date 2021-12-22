import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
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
  let i18nService: DeepMocked<I18nService>;

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

    i18nService = createMock<I18nService>();

    i18nService.translate.mockImplementation(async (text) => {
      switch (text) {
        case 'industries.health':
          return 'Health';
        case 'industries.constructionAndEngineering':
          return 'Construction & Engineering';
        case 'nations.england':
          return 'England';
        case 'nations.scotland':
          return 'Scotland';
        case 'nations.wales':
          return 'Wales';
        case 'nations.northernIreland':
          return 'Northern Ireland';
        default:
          return '';
      }
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [
        { provide: IndustriesService, useValue: industriesService },
        { provide: ProfessionsService, useValue: professionsService },
        { provide: I18nService, useValue: i18nService },
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

        await controller.edit(response, 'profession-id');

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/top-level-information',
          {
            name: null,
            industriesCheckboxArgs: [
              {
                text: 'Health',
                value: 'health-uuid',
                checked: false,
              },
              {
                text: 'Construction & Engineering',
                value: 'construction-uuid',
                checked: false,
              },
            ],
            nationsCheckboxArgs: [
              {
                text: 'England',
                value: 'GB-ENG',
                checked: false,
              },
              {
                text: 'Scotland',
                value: 'GB-SCT',
                checked: false,
              },
              {
                text: 'Wales',
                value: 'GB-WLS',
                checked: false,
              },
              {
                text: 'Northern Ireland',
                value: 'GB-NIR',
                checked: false,
              },
            ],
            errors: undefined,
          },
        );
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

        await controller.edit(response, 'profession-id');

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/top-level-information',
          {
            name: 'Example Profession',
            industriesCheckboxArgs: [
              {
                text: 'Health',
                value: 'health-uuid',
                checked: true,
              },
              {
                text: 'Construction & Engineering',
                value: 'construction-uuid',
                checked: false,
              },
            ],
            nationsCheckboxArgs: [
              {
                text: 'England',
                value: 'GB-ENG',
                checked: true,
              },
              {
                text: 'Scotland',
                value: 'GB-SCT',
                checked: true,
              },
              {
                text: 'Wales',
                value: 'GB-WLS',
                checked: false,
              },
              {
                text: 'Northern Ireland',
                value: 'GB-NIR',
                checked: false,
              },
            ],
            errors: undefined,
          },
        );
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

      describe('getSelectedIndustriesFromDtoThenProfession', () => {
        const industry = new Industry('industries.health');
        const profession = new Profession(
          'Example Profession',
          null,
          null,
          null,
          ['GB-ENG', 'GB-SCT'],
          null,
          [industry],
        );

        describe('when there is an existing Profession with Industries selected and new params are submitted', () => {
          it('returns the dto value, over the Profession', async () => {
            const replacementIndustry = new Industry(
              'industries.constructionAndEngineering',
            );

            const topLevelDetailsWithNewIndustries = {
              name: 'Example Profession',
              nations: ['GB-ENG'],
              industries: ['construction-uuid'],
            };

            industriesService.findByIds.mockResolvedValue([
              replacementIndustry,
            ]);

            await expect(
              controller.getSelectedIndustriesFromDtoThenProfession(
                profession,
                topLevelDetailsWithNewIndustries,
              ),
            ).resolves.toEqual([replacementIndustry]);
          });
        });

        describe('when there is an existing Profession with Industries selected and empty Industry params are submitted', () => {
          it('returns the Profession value', async () => {
            const topLevelDetailsWithNewIndustries = {
              name: 'Gas Safe Engineer',
              nations: ['GB-ENG'],
              industries: null,
            };

            await expect(
              controller.getSelectedIndustriesFromDtoThenProfession(
                profession,
                topLevelDetailsWithNewIndustries,
              ),
            ).resolves.toEqual([industry]);
          });
        });

        describe('when there are not yet any Industries on the profession and empty Industries params are submitted', () => {
          const blankProfession = new Profession();

          it('returns an empty array', async () => {
            const topLevelDetailsWithMissingIndustries = {
              name: 'Gas Safe Engineer',
              nations: ['GB-ENG'],
              industries: undefined,
            };

            await expect(
              controller.getSelectedIndustriesFromDtoThenProfession(
                blankProfession,
                topLevelDetailsWithMissingIndustries,
              ),
            ).resolves.toEqual([]);
          });
        });
      });

      describe('getSelectedNationsFromDtoThenProfession', () => {
        const profession = new Profession(
          'Example Profession',
          null,
          null,
          null,
          ['GB-ENG', 'GB-SCT'],
          null,
          [new Industry('industries.health')],
        );

        describe('when there is an existing Profession with Nations selected and new params are submitted', () => {
          it('returns the dto value, over the Profession', () => {
            const topLevelDetailsWithNewNations = {
              name: 'Gas Safe Engineer',
              nations: ['GB-NIR'],
              industries: ['construction-uuid'],
            };

            expect(
              controller.getSelectedNationsFromDtoThenProfession(
                profession,
                topLevelDetailsWithNewNations,
              ),
            ).toEqual(['GB-NIR']);
          });
        });

        describe('when there is an existing Profession with Nations selected and empty Nation params are submitted', () => {
          it('returns the Profession value', () => {
            const topLevelDetailsWithMissingNations = {
              name: 'Gas Safe Engineer',
              nations: undefined,
              industries: ['construction-uuid'],
            };

            expect(
              controller.getSelectedNationsFromDtoThenProfession(
                profession,
                topLevelDetailsWithMissingNations,
              ),
            ).toEqual(['GB-ENG', 'GB-SCT']);
          });
        });

        describe('when there are not yet any Nations on the profession and empty Nation params are submitted', () => {
          const blankProfession = new Profession();

          it('returns an empty array', () => {
            const topLevelDetailsWithMissingNations = {
              name: 'Gas Safe Engineer',
              nations: undefined,
              industries: ['construction-uuid'],
            };

            expect(
              controller.getSelectedNationsFromDtoThenProfession(
                blankProfession,
                topLevelDetailsWithMissingNations,
              ),
            ).toEqual([]);
          });
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
