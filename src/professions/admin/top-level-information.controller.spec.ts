import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import professionFactory from '../../testutils/factories/profession';

import { IndustriesService } from '../../industries/industries.service';
import { ProfessionsService } from '../professions.service';
import { TopLevelInformationController } from './top-level-information.controller';
import industryFactory from '../../testutils/factories/industry';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';

describe('TopLevelInformationController', () => {
  let controller: TopLevelInformationController;
  let professionsService: DeepMocked<ProfessionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let response: DeepMocked<Response>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    industriesService = createMock<IndustriesService>();
    professionsService = createMock<ProfessionsService>();

    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopLevelInformationController],
      providers: [
        { provide: IndustriesService, useValue: industriesService },
        { provide: ProfessionsService, useValue: professionsService },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<TopLevelInformationController>(
      TopLevelInformationController,
    );
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession', () => {
      it('should fetch all Industries and Nations to be displayed in an option select, with none of them checked', async () => {
        const blankProfession = professionFactory
          .justCreated('profession-id')
          .build();

        const industries = [
          industryFactory.build({
            name: 'industries.health',
            id: 'health-uuid',
          }),
          industryFactory.build({
            name: 'industries.constructionAndEngineering',
            id: 'construction-uuid',
          }),
        ];

        industriesService.all.mockResolvedValue(industries);

        professionsService.find.mockResolvedValue(blankProfession);

        await controller.edit(response, 'profession-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: undefined,
            industriesCheckboxArgs: [
              {
                text: translationOf('industries.health'),
                value: 'health-uuid',
                checked: false,
              },
              {
                text: translationOf('industries.constructionAndEngineering'),
                value: 'construction-uuid',
                checked: false,
              },
            ],
            nationsCheckboxArgs: [
              {
                text: translationOf('nations.england'),
                value: 'GB-ENG',
                checked: false,
              },
              {
                text: translationOf('nations.scotland'),
                value: 'GB-SCT',
                checked: false,
              },
              {
                text: translationOf('nations.wales'),
                value: 'GB-WLS',
                checked: false,
              },
              {
                text: translationOf('nations.northernIreland'),
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
      it('should pre-fill the Profession name and pre-select checkboxes for selected Nations and Industries', async () => {
        const healthIndustry = industryFactory.build({
          name: 'industries.health',
          id: 'health-uuid',
        });

        const profession = professionFactory.build({
          name: 'Example Profession',
          occupationLocations: ['GB-ENG', 'GB-SCT'],
          industries: [healthIndustry],
        });

        professionsService.find.mockResolvedValue(profession);

        industriesService.all.mockResolvedValue([
          healthIndustry,
          industryFactory.build({
            name: 'industries.constructionAndEngineering',
            id: 'construction-uuid',
          }),
        ]);

        await controller.edit(response, 'profession-id', false);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/top-level-information',
          expect.objectContaining({
            name: 'Example Profession',
            industriesCheckboxArgs: [
              {
                text: translationOf('industries.health'),
                value: 'health-uuid',
                checked: true,
              },
              {
                text: translationOf('industries.constructionAndEngineering'),
                value: 'construction-uuid',
                checked: false,
              },
            ],
            nationsCheckboxArgs: [
              {
                text: translationOf('nations.england'),
                value: 'GB-ENG',
                checked: true,
              },
              {
                text: translationOf('nations.scotland'),
                value: 'GB-SCT',
                checked: true,
              },
              {
                text: translationOf('nations.wales'),
                value: 'GB-WLS',
                checked: false,
              },
              {
                text: translationOf('nations.northernIreland'),
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
        const profession = professionFactory
          .justCreated('profession-id')
          .build();

        professionsService.find.mockResolvedValue(profession);

        const topLevelDetailsDto = {
          name: 'Gas Safe Engineer',
          nations: ['GB-ENG'],
          industries: ['construction-uuid'],
        };

        const constructionIndustry = industryFactory.build({
          name: 'industries.constructionAndEngineering',
          id: 'construction-uuid',
        });

        industriesService.findByIds.mockResolvedValue([constructionIndustry]);

        await controller.update(topLevelDetailsDto, response, 'profession-id');

        expect(professionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'profession-id',
            name: 'Gas Safe Engineer',
            occupationLocations: ['GB-ENG'],
            industries: [constructionIndustry],
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
          'admin/professions/top-level-information',
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

          const industry = industryFactory.build({ id: 'construction-uuid' });

          professionsService.find.mockResolvedValue(profession);

          const topLevelDetailsDtoWithChangeParam = {
            name: 'A new profession',
            nations: ['GB-ENG'],
            industries: ['construction-uuid'],
            change: true,
          };

          industriesService.findByIds.mockResolvedValue([industry]);

          await controller.update(
            topLevelDetailsDtoWithChangeParam,
            response,
            'profession-id',
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/check-your-answers',
          );
        });
      });

      describe('when set to false', () => {
        it('continues to the next step in the journey', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          const industry = industryFactory.build({ id: 'construction-uuid' });

          professionsService.find.mockResolvedValue(profession);

          const topLevelDetailsDtoWithoutChangeParam = {
            name: 'A new profession',
            nations: ['GB-ENG'],
            industries: ['construction-uuid'],
          };

          industriesService.findByIds.mockResolvedValue([industry]);

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
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
