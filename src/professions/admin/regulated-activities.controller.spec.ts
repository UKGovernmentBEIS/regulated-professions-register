import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { translationOf } from '../../testutils/translation-of';
import { RegulationType } from '../profession-version.entity';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionsService } from '../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesTemplate } from './interfaces/regulated-activities.template';
import { RegulatedActivitiesController } from './regulated-activities.controller';
import { RegulationTypeRadioButtonsPresenter } from './presenters/regulation-type-radio-buttons.presenter';
import userFactory from '../../testutils/factories/user';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { stringOfLength } from '../../testutils/string-of-length';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../helpers/input-limits';

jest.mock('../../users/helpers/check-can-change-profession');

describe(RegulatedActivitiesController, () => {
  let controller: RegulatedActivitiesController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let response: DeepMocked<Response>;
  let i18nService: I18nService;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulatedActivitiesController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<RegulatedActivitiesController>(
      RegulatedActivitiesController,
    );
  });

  describe('edit', () => {
    it('should render the regulated activities page, passing in any values on the Profession that have already been set', async () => {
      const profession = professionFactory.build({
        id: 'profession-id',
      });

      const version = professionVersionFactory.build({
        id: 'version-id',
        profession: profession,
        description: 'Example regulation summary',
        regulationType: RegulationType.Certification,
        reservedActivities: 'Example reserved activities',
      });

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);

      const mockRegulationTypeRadioButtonArgs: RadioButtonArgs[] = [
        {
          text: 'Example regulation type',
          value: 'example',
          checked: false,
        },
      ];

      const regulationTypeRadioButtonArgsSpy = jest
        .spyOn(RegulationTypeRadioButtonsPresenter.prototype, 'radioButtonArgs')
        .mockResolvedValue(mockRegulationTypeRadioButtonArgs);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.edit(response, 'profession-id', 'version-id', request);

      expect(response.render).toHaveBeenCalledWith(
        'admin/professions/regulated-activities',
        expect.objectContaining({
          regulationSummary: 'Example regulation summary',
          regulationTypeRadioButtonArgs: mockRegulationTypeRadioButtonArgs,
          reservedActivities: 'Example reserved activities',
          captionText: translationOf('professions.form.captions.edit'),
        } as RegulatedActivitiesTemplate),
      );

      expect(regulationTypeRadioButtonArgsSpy).toBeCalled();
    });

    it('should check the user has permission to view the page', async () => {
      const profession = professionFactory.build({
        id: 'profession-id',
      });

      professionsService.findWithVersions.mockResolvedValue(profession);

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
      describe('when the "Change" query param is false', () => {
        it('updates the Profession and redirects to the next page in the journey', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
            description: 'Example regulation summary',
            reservedActivities: 'Example reserved activities',
            protectedTitles: 'Example protected titles',
            regulationUrl: 'https://example.com/regulation',
          });

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const regulatedActivitiesDto: RegulatedActivitiesDto = {
            regulationSummary: 'Example regulation summary',
            regulationType: RegulationType.Accreditation,
            reservedActivities: 'Example reserved activities',
            protectedTitles: 'Example protected titles',
            regulationUrl: 'https://example.com/regulation',
          };

          const request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatedActivitiesDto,
            request,
          );

          expect(professionVersionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'version-id',
              description: 'Example regulation summary',
              regulationType: RegulationType.Accreditation,
              reservedActivities: 'Example reserved activities',
              protectedTitles: 'Example protected titles',
              regulationUrl: 'https://example.com/regulation',
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/check-your-answers',
          );
        });
      });

      describe('when the provided URL is mis-formatted', () => {
        it('correctly formats the URL before saving', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });
          const version = professionVersionFactory.build({
            id: 'version-id',
            profession: profession,
            description: 'Example regulation summary',
            reservedActivities: 'Example reserved activities',
            protectedTitles: 'Example protected titles',
            regulationUrl: 'http://example.com/regulation',
          });

          professionsService.findWithVersions.mockResolvedValue(profession);
          professionVersionsService.findWithProfession.mockResolvedValue(
            version,
          );

          const regulatedActivitiesDto: RegulatedActivitiesDto = {
            regulationSummary: 'Example regulation summary',
            regulationType: RegulationType.Certification,
            reservedActivities: 'Example reserved activities',
            protectedTitles: 'Example protected titles',
            regulationUrl: ' example.com/regulation',
          };

          const request = createDefaultMockRequest({
            user: userFactory.build(),
          });

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatedActivitiesDto,
            request,
          );

          expect(professionVersionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'version-id',
              description: 'Example regulation summary',
              regulationType: RegulationType.Certification,
              reservedActivities: 'Example reserved activities',
              protectedTitles: 'Example protected titles',
              regulationUrl: 'http://example.com/regulation',
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/check-your-answers',
          );
        });
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the Profession, and re-renders the regulated activities form page with errors', async () => {
        const profession = professionFactory.build();

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          description: 'Example regulation summary',
          regulationType: RegulationType.Accreditation,
          reservedActivities: 'Example reserved activities',
          protectedTitles: 'Example protected titles',
          regulationUrl: 'https://example.com/regulation',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const regulatedActivitiesDto: RegulatedActivitiesDto = {
          regulationSummary: '',
          regulationType: undefined,
          reservedActivities: '',
          protectedTitles: '',
          regulationUrl: '',
        };

        const request = createDefaultMockRequest({ user: userFactory.build() });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          regulatedActivitiesDto,
          request,
        );

        expect(professionVersionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/regulated-activities',
          expect.objectContaining({
            errors: {
              regulationSummary: {
                text: 'professions.form.errors.regulationSummary.empty',
              },
              regulationType: {
                text: 'professions.form.errors.regulationType.empty',
              },
              reservedActivities: {
                text: 'professions.form.errors.reservedActivities.empty',
              },
            },
          }),
        );
      });
    });

    describe('when the entries are too long', () => {
      it('does not update the Profession, and re-renders the regulated activities form page with errors', async () => {
        const profession = professionFactory.build();

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          description: 'Example regulation summary',
          regulationType: RegulationType.Accreditation,
          reservedActivities: 'Example reserved activities',
          protectedTitles: 'Example protected titles',
          regulationUrl: 'https://example.com/regulation',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const regulatedActivitiesDto: RegulatedActivitiesDto = {
          regulationSummary: stringOfLength(MAX_MULTI_LINE_LENGTH + 1),
          regulationType: RegulationType.Accreditation,
          reservedActivities: stringOfLength(MAX_MULTI_LINE_LENGTH + 1),
          protectedTitles: stringOfLength(MAX_MULTI_LINE_LENGTH + 1),
          regulationUrl: `http://example.com/?data=${stringOfLength(
            MAX_URL_LENGTH + 1,
          )}`,
        };

        const request = createDefaultMockRequest({ user: userFactory.build() });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          regulatedActivitiesDto,
          request,
        );

        expect(professionVersionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/regulated-activities',
          expect.objectContaining({
            errors: {
              regulationSummary: {
                text: 'professions.form.errors.regulationSummary.long',
              },
              reservedActivities: {
                text: 'professions.form.errors.reservedActivities.long',
              },
              protectedTitles: {
                text: 'professions.form.errors.protectedTitles.long',
              },
              regulationUrl: {
                text: 'professions.form.errors.regulationUrl.long',
              },
            },
          }),
        );
      });
    });

    it('checks the user has permissions to update the profession', async () => {
      const profession = professionFactory.build({ id: 'profession-id' });

      professionsService.findWithVersions.mockResolvedValue(profession);

      const regulatedActivitiesDto: RegulatedActivitiesDto = {
        regulationSummary: 'Example regulation summary',
        regulationType: RegulationType.Accreditation,
        reservedActivities: 'Example reserved activities',
        protectedTitles: 'Example protected titles',
        regulationUrl: 'https://example.com/regulation',
      };

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      await controller.update(
        response,
        'profession-id',
        'version-id',
        regulatedActivitiesDto,
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
