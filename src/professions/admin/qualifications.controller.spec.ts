import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import { QualificationsDto } from './dto/qualifications.dto';
import { QualificationsController } from './qualifications.controller';
import { ProfessionVersionsService } from '../profession-versions.service';
import { isUK } from '../../helpers/nations.helper';

import professionVersionFactory from '../../testutils/factories/profession-version';
import qualificationFactory from '../../testutils/factories/qualification';
import { translationOf } from '../../testutils/translation-of';
import userFactory from '../../testutils/factories/user';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import { checkCanChangeProfession } from '../../users/helpers/check-can-change-profession';
import { OtherCountriesRecognitionRoutes } from '../../qualifications/qualification.entity';
import {
  MAX_MULTI_LINE_LENGTH,
  MAX_URL_LENGTH,
} from '../../helpers/input-limits';
import { stringOfLength } from '../../testutils/string-of-length';

jest.mock('../../helpers/nations.helper');
jest.mock('../../users/helpers/check-can-change-profession');

describe(QualificationsController, () => {
  let controller: QualificationsController;
  let response: DeepMocked<Response>;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let i18nService: I18nService;

  beforeEach(async () => {
    i18nService = createMockI18nService();
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [QualificationsController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
        },
        { provide: I18nService, useValue: i18nService },
      ],
    }).compile();

    response = createMock<Response>();

    controller = module.get<QualificationsController>(QualificationsController);
  });

  describe('edit', () => {
    describe('when the Profession is complete', () => {
      it('should render form page', async () => {
        const profession = professionFactory.build({
          id: 'profession-id',
        });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          qualification: qualificationFactory.build(),
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        (isUK as jest.Mock).mockImplementation(() => false);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/qualifications',
          expect.objectContaining({
            routesToObtain: profession.qualification.routesToObtain,
            moreInformationUrl: profession.qualification.url,
            captionText: translationOf('professions.form.captions.edit'),
            ukRecognition: profession.qualification.ukRecognition,
            ukRecognitionUrl: profession.qualification.ukRecognitionUrl,
            otherCountriesRecognitionSummary:
              profession.qualification.otherCountriesRecognitionSummary,
            otherCountriesRecognitionUrl:
              profession.qualification.ukRecognitionUrl,
            isUK: false,
          }),
        );
      });
    });

    describe('when the Profession has just been created by a service owner user', () => {
      it('returns a mostly empty table row', async () => {
        const profession = professionFactory
          .justCreated('profession-id')
          .build({
            name: 'Example Profession',
            slug: 'example-profession',
          });

        const version = professionVersionFactory
          .justCreated('version-id')
          .build({
            profession: profession,
          });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        (isUK as jest.Mock).mockImplementation(() => false);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.edit(response, 'profession-id', 'version-id', request);

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/qualifications',
          expect.objectContaining({
            routesToObtain: undefined,
            moreInformationUrl: undefined,
            captionText: translationOf('professions.form.captions.edit'),
            ukRecognition: undefined,
            ukRecognitionUrl: undefined,
            isUK: false,
          }),
        );
      });
    });

    it('should check the user has permission to view the Profession', async () => {
      const profession = professionFactory.build();

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
      it('creates a new Qualification on the Profession and redirects to the next page in the journey', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          qualification: qualificationFactory.build(),
        });

        const dto: QualificationsDto = {
          routesToObtain: 'General secondary education',
          moreInformationUrl: 'http://www.example.com/more-info',
          ukRecognition: 'ukRecognition',
          ukRecognitionUrl: 'http://example.com/uk',
          otherCountriesRecognitionRoutes:
            'all' as OtherCountriesRecognitionRoutes,
          otherCountriesRecognitionSummary:
            'other countries recognition summary',
          otherCountriesRecognitionUrl: 'http://example.com/overseas',
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          dto,
          request,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            qualification: expect.objectContaining({
              routesToObtain: 'General secondary education',
              url: 'http://www.example.com/more-info',
              ukRecognition: 'ukRecognition',
              ukRecognitionUrl: 'http://example.com/uk',
              otherCountriesRecognitionRoutes:
                'all' as OtherCountriesRecognitionRoutes,
              otherCountriesRecognitionSummary:
                'other countries recognition summary',
              otherCountriesRecognitionUrl: 'http://example.com/overseas',
            }),
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    describe('when provided URLs are mis-formatted', () => {
      it('correctly formats the URLs before saving', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          qualification: qualificationFactory.build(),
        });

        const dto: QualificationsDto = {
          routesToObtain: 'General secondary education',
          moreInformationUrl: 'www.example.com/more-info ',
          ukRecognition: 'ukRecognition',
          ukRecognitionUrl: 'example.com/uk',
          otherCountriesRecognitionRoutes:
            'all' as OtherCountriesRecognitionRoutes,
          otherCountriesRecognitionSummary:
            'other countries recognition summary',
          otherCountriesRecognitionUrl: 'example.com/overseas',
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          dto,
          request,
        );

        expect(professionVersionsService.save).toHaveBeenCalledWith(
          expect.objectContaining({
            qualification: expect.objectContaining({
              routesToObtain: 'General secondary education',
              url: 'http://www.example.com/more-info',
              ukRecognition: 'ukRecognition',
              ukRecognitionUrl: 'http://example.com/uk',
              otherCountriesRecognitionRoutes:
                'all' as OtherCountriesRecognitionRoutes,
              otherCountriesRecognitionSummary:
                'other countries recognition summary',
              otherCountriesRecognitionUrl: 'http://example.com/overseas',
            }),
          }),
        );

        expect(response.redirect).toHaveBeenCalledWith(
          '/admin/professions/profession-id/versions/version-id/check-your-answers',
        );
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the Profession and reloads the form with errors and successfully submitted values', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          qualification: qualificationFactory.build(),
        });

        const dto: QualificationsDto = {
          routesToObtain: '',
          moreInformationUrl: 'not a url',
          ukRecognition: '',
          ukRecognitionUrl: 'not a url',
          otherCountriesRecognitionRoutes: undefined,
          otherCountriesRecognitionSummary: '',
          otherCountriesRecognitionUrl: 'not a url',
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        (isUK as jest.Mock).mockImplementation(() => false);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          dto,
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/qualifications',
          expect.objectContaining({
            isUK: false,
            errors: {
              routesToObtain: {
                text: 'professions.form.errors.qualification.routesToObtain.empty',
              },
              moreInformationUrl: {
                text: 'professions.form.errors.qualification.moreInformationUrl.invalid',
              },
              ukRecognitionUrl: {
                text: 'professions.form.errors.qualification.ukRecognitionUrl.invalid',
              },
              otherCountriesRecognitionRoutes: {
                text: 'professions.form.errors.qualification.otherCountriesRecognitionRoutes.empty',
              },
              otherCountriesRecognitionUrl: {
                text: 'professions.form.errors.qualification.otherCountriesRecognitionUrl.invalid',
              },
            },
          }),
        );
      });
    });

    describe('when the entires are too long', () => {
      it('does not update the Profession and reloads the form with errors and successfully submitted values', async () => {
        const profession = professionFactory.build({ id: 'profession-id' });

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          qualification: qualificationFactory.build(),
        });

        const dto: QualificationsDto = {
          routesToObtain: stringOfLength(MAX_MULTI_LINE_LENGTH + 1),
          moreInformationUrl: `http://example.com/?data=${stringOfLength(
            MAX_URL_LENGTH + 1,
          )}`,
          ukRecognition: stringOfLength(MAX_MULTI_LINE_LENGTH + 1),
          ukRecognitionUrl: `http://example.com/?data=${stringOfLength(
            MAX_URL_LENGTH + 1,
          )}`,
          otherCountriesRecognitionRoutes: OtherCountriesRecognitionRoutes.None,
          otherCountriesRecognitionSummary: stringOfLength(
            MAX_MULTI_LINE_LENGTH + 1,
          ),
          otherCountriesRecognitionUrl: `http://example.com/?data=${stringOfLength(
            MAX_URL_LENGTH + 1,
          )}`,
        };

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);
        (isUK as jest.Mock).mockImplementation(() => false);

        const request = createDefaultMockRequest({
          user: userFactory.build(),
        });

        await controller.update(
          response,
          'profession-id',
          'version-id',
          dto,
          request,
        );

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/qualifications',
          expect.objectContaining({
            isUK: false,
            errors: {
              routesToObtain: {
                text: 'professions.form.errors.qualification.routesToObtain.long',
              },
              moreInformationUrl: {
                text: 'professions.form.errors.qualification.moreInformationUrl.long',
              },
              ukRecognition: {
                text: 'professions.form.errors.qualification.ukRecognition.long',
              },
              ukRecognitionUrl: {
                text: 'professions.form.errors.qualification.ukRecognitionUrl.long',
              },
              otherCountriesRecognitionSummary: {
                text: 'professions.form.errors.qualification.otherCountriesRecognitionSummary.long',
              },
              otherCountriesRecognitionUrl: {
                text: 'professions.form.errors.qualification.otherCountriesRecognitionUrl.long',
              },
            },
          }),
        );
      });
    });

    it('should check the user has permission to update the Profession', async () => {
      const profession = professionFactory.build();

      professionsService.findWithVersions.mockResolvedValue(profession);

      const request = createDefaultMockRequest({
        user: userFactory.build(),
      });

      const dto: QualificationsDto = {
        routesToObtain: 'General secondary education',
        moreInformationUrl: 'http://www.example.com/more-info',
        ukRecognition: 'ukRecognition',
        ukRecognitionUrl: 'http://example.com/uk',
        otherCountriesRecognitionRoutes:
          'all' as OtherCountriesRecognitionRoutes,
        otherCountriesRecognitionSummary: 'other countries recognition summary',
        otherCountriesRecognitionUrl: 'http://example.com/overseas',
      };

      await controller.update(
        response,
        'profession-id',
        'version-id',
        dto,
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
