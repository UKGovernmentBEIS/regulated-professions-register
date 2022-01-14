import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import professionFactory from '../../../testutils/factories/profession';

import { IndustriesService } from '../../../industries/industries.service';
import { ProfessionsService } from '../../professions.service';
import { TopLevelInformationController } from './top-level-information.controller';
import industryFactory from '../../../testutils/factories/industry';

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let response: DeepMocked<Response>;
  let i18nService: DeepMocked<I18nService>;

  const healthIndustry = industryFactory.build({
    name: 'industries.health',
    id: 'health-uuid',
  });
  const constructionIndustry = industryFactory.build({
    name: 'industries.constructionAndEngineering',
    id: 'construction-uuid',
  });

  const industries = [healthIndustry, constructionIndustry];

  beforeEach(async () => {
    const profession = professionFactory.build({
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
      const blankProfession = professionFactory
        .justCreated('profession-id')
        .build();

      it('should fetch all Industries and Nations to be displayed in an option select, with none of them checked', async () => {
        professionsService.find.mockImplementation(async () => blankProfession);

        await controller.edit(response, 'profession-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/add-profession/top-level-information',
          expect.objectContaining({
            name: undefined,
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
          }),
        );
        expect(industriesService.all).toHaveBeenCalled();
      });
    });

    describe('when an existing Profession is found', () => {
      const existingProfession = professionFactory.build({
        name: 'Example Profession',
        occupationLocations: ['GB-ENG', 'GB-SCT'],
        industries: [
          industryFactory.build({
            id: 'health-uuid',
            name: 'industries.health ',
          }),
        ],
      });

      it('should pre-fill the Profession name and pre-select checkboxes for selected Nations and Industries', async () => {
        professionsService.find.mockImplementation(
          async () => existingProfession,
        );

        await controller.edit(response, 'profession-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/add-profession/top-level-information',
          expect.objectContaining({
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
          }),
        );
        expect(industriesService.all).toHaveBeenCalled();
      });
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the next page in the journey', async () => {
        const topLevelDetailsDto = {
          name: 'Gas Safe Engineer',
          nations: ['GB-ENG'],
          industries: ['construction-uuid'],
        };

        industriesService.findByIds.mockResolvedValue(industries);

        await controller.update(topLevelDetailsDto, response, 'profession-id');

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            name: 'Gas Safe Engineer',
            occupationLocations: ['GB-ENG'],
            industries,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/regulatory-body/edit',
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

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/add-profession/top-level-information',
          expect.objectContaining({
            errors: {
              name: {
                text: 'professions.form.errors.name.empty',
              },
              nations: {
                text: 'professions.form.errors.nations.empty',
              },
              industries: {
                text: 'professions.form.errors.industries.empty',
              },
            },
          }),
        );

        expect(professionsService.save).not.toHaveBeenCalled();
        expect(industriesService.all).toHaveBeenCalled();
      });
    });

    describe('the "change" query param', () => {
      describe('when set to true', () => {
        it('redirects to check your answers on submit', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.find.mockImplementation(async () => profession);

          const topLevelDetailsDtoWithChangeParam = {
            name: 'A new profession',
            nations: ['GB-ENG'],
            industries: ['construction-uuid'],
            change: true,
          };

          industriesService.findByIds.mockResolvedValue([constructionIndustry]);

          await controller.update(
            topLevelDetailsDtoWithChangeParam,
            response,
            'profession-id',
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/check-your-answers',
          );
        });

        it('sets the back link to point to check your answers', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.find.mockImplementation(async () => profession);

          await controller.edit(response, 'profession-id', true);

          expect(response.render).toHaveBeenCalledWith(
            'admin/professions/add-profession/top-level-information',
            expect.objectContaining({
              backLink: '/admin/professions/profession-id/check-your-answers',
            }),
          );
        });
      });

      describe('when set to false', () => {
        it('continues to the next step in the journey', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.find.mockImplementation(async () => profession);

          const topLevelDetailsDtoWithoutChangeParam = {
            name: 'A new profession',
            nations: ['GB-ENG'],
            industries: ['construction-uuid'],
          };

          industriesService.findByIds.mockResolvedValue([constructionIndustry]);

          await controller.update(
            topLevelDetailsDtoWithoutChangeParam,
            response,
            'profession-id',
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/regulatory-body/edit',
          );
        });
      });

      it('sets the back link to point to the previous page in the journey', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });

        professionsService.find.mockImplementation(async () => profession);

        await controller.edit(response, 'profession-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/add-profession/top-level-information',
          expect.objectContaining({
            backLink: '/admin/professions',
          }),
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
