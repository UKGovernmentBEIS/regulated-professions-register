import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { TestingModule, Test } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import professionFactory from '../../testutils/factories/profession';

import { IndustriesService } from '../../industries/industries.service';
import { ProfessionsService } from '../professions.service';
import { ScopeController } from './scope.controller';
import industryFactory from '../../testutils/factories/industry';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { translationOf } from '../../testutils/translation-of';
import { ProfessionVersionsService } from '../profession-versions.service';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import userFactory from '../../testutils/factories/user';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';

jest.mock('../../users/helpers/check-can-change-profession');

describe('ScopeController', () => {
  let controller: ScopeController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let industriesService: DeepMocked<IndustriesService>;
  let response: DeepMocked<Response>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    industriesService = createMock<IndustriesService>();
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();

    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScopeController],
      providers: [
        { provide: IndustriesService, useValue: industriesService },
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<ScopeController>(ScopeController);
  });

  describe('edit', () => {
    describe('when editing a just-created, blank Profession and its blank Version', () => {
      it('should fetch all Industries and Nations to be displayed in an option select, with none of them checked', async () => {
        const blankProfession = professionFactory
          .justCreated('profession-id')
          .build();

        const blankVersion = professionVersionFactory
          .justCreated('version-id')
          .build({ profession: blankProfession });

        professionsService.findWithVersions.mockResolvedValue(blankProfession);
        professionVersionsService.findWithProfession.mockResolvedValue(
          blankVersion,
        );

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

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/scope',
          expect.objectContaining({
            coversUK: null,
            industriesCheckboxItems: [
              {
                text: translationOf('industries.constructionAndEngineering'),
                value: 'construction-uuid',
                checked: false,
              },
              {
                text: translationOf('industries.health'),
                value: 'health-uuid',
                checked: false,
              },
            ],
            nationsCheckboxArgs: {
              idPrefix: 'nations',
              name: 'nations[]',
              hint: {
                text: translationOf(
                  'professions.form.hint.scope.certainNations',
                ),
              },
              items: [
                {
                  text: translationOf('nations.england'),
                  value: 'GB-ENG',
                  checked: false,
                },
                {
                  text: translationOf('nations.northernIreland'),
                  value: 'GB-NIR',
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
              ],
            },
            captionText: translationOf('professions.form.captions.add'),
          }),
        );
        expect(industriesService.all).toHaveBeenCalled();
      });
    });

    describe('when an existing Profession and Version are found', () => {
      it('should pre-fill the Profession name and pre-select checkboxes for selected Nations and Industries', async () => {
        const healthIndustry = industryFactory.build({
          name: 'industries.health',
          id: 'health-uuid',
        });

        const profession = professionFactory.build();

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          occupationLocations: ['GB-ENG', 'GB-SCT'],
          industries: [healthIndustry],
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        industriesService.all.mockResolvedValue([
          healthIndustry,
          industryFactory.build({
            name: 'industries.constructionAndEngineering',
            id: 'construction-uuid',
          }),
        ]);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/scope',
          expect.objectContaining({
            coversUK: false,
            industriesCheckboxItems: [
              {
                text: translationOf('industries.constructionAndEngineering'),
                value: 'construction-uuid',
                checked: false,
              },
              {
                text: translationOf('industries.health'),
                value: 'health-uuid',
                checked: true,
              },
            ],
            nationsCheckboxArgs: {
              idPrefix: 'nations',
              name: 'nations[]',
              hint: {
                text: translationOf(
                  'professions.form.hint.scope.certainNations',
                ),
              },
              items: [
                {
                  text: translationOf('nations.england'),
                  value: 'GB-ENG',
                  checked: true,
                },
                {
                  text: translationOf('nations.northernIreland'),
                  value: 'GB-NIR',
                  checked: false,
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
              ],
            },
            captionText: translationOf('professions.form.captions.edit'),
          }),
        );
        expect(industriesService.all).toHaveBeenCalled();
      });

      it('should set coversUK to 1 if the profession covers all of the UK', async () => {
        const profession = professionFactory.build();

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          occupationLocations: ['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'],
          industries: [],
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/scope',
          expect.objectContaining({
            coversUK: true,
          }),
        );
      });
    });

    it('checks the user has permission to view the profession', async () => {
      const profession = professionFactory.build();

      const version = professionVersionFactory.build();

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.edit(response, 'profession-id', 'version-id', request);

      expect(checkCanChangeProfession).toHaveBeenCalledWith(
        request,
        profession,
      );
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      it('updates the Profession and redirects to the next page in the journey', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const scopeDto = {
          coversUK: '0',
          nations: ['GB-ENG'],
          industries: ['construction-uuid'],
        };

        const constructionIndustry = industryFactory.build({
          name: 'industries.constructionAndEngineering',
          id: 'construction-uuid',
        });

        industriesService.findByIds.mockResolvedValue([constructionIndustry]);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          scopeDto,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'version-id',
            occupationLocations: ['GB-ENG'],
            industries: [constructionIndustry],
            profession: profession,
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });

      it('sets all nations when `coversUK` is set to `1`', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build();

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const scopeDto = {
          coversUK: '1',
          industries: ['construction-uuid'],
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          scopeDto,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            occupationLocations: ['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'],
          }),
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the profession, and re-renders the scope view with errors', async () => {
        const scopeDtoWithNoAnswers = {
          nations: undefined,
          coversUK: null,
          industries: undefined,
        };

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          scopeDtoWithNoAnswers,
          response,
          'profession-id',
          'version-id',
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/scope',
          expect.objectContaining({
            errors: {
              coversUK: {
                text: 'professions.form.errors.nations.empty',
              },
              industries: {
                text: 'professions.form.errors.industries.empty',
              },
            },
          }),
        );

        expect(industriesService.all).toHaveBeenCalled();
      });
    });

    it('checks the user has permission to update the profession', async () => {
      const profession = professionFactory.build();

      const version = professionVersionFactory.build();

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const scopeDto = {
        coversUK: '0',
        nations: ['GB-ENG'],
        industries: ['construction-uuid'],
      };

      await controller.update(
        scopeDto,
        response,
        'profession-id',
        'version-id',
        request,
      );

      expect(checkCanChangeProfession).toHaveBeenCalledWith(
        request,
        profession,
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
