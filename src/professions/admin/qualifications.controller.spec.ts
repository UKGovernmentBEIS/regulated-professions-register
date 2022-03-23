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
import organisationFactory from '../../testutils/factories/organisation';
import { translationOf } from '../../testutils/translation-of';
import userFactory from '../../testutils/factories/user';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';

jest.mock('../../helpers/nations.helper');
jest.mock('../../users/helpers/check-can-view-profession');

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
            organisation: organisationFactory.build(),
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

      expect(checkCanViewProfession).toHaveBeenCalledWith(request, profession);
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
      };

      await controller.update(
        response,
        'profession-id',
        'version-id',
        dto,
        request,
      );

      expect(checkCanViewProfession).toHaveBeenCalledWith(request, profession);
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
