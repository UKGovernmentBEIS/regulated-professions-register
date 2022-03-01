import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import professionFactory from '../../testutils/factories/profession';
import professionVersionFactory from '../../testutils/factories/profession-version';
import { ProfessionVersionsService } from '../profession-versions.service';
import { ProfessionsService } from '../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesController } from './regulated-activities.controller';

describe(RegulatedActivitiesController, () => {
  let controller: RegulatedActivitiesController;
  let professionsService: DeepMocked<ProfessionsService>;
  let professionVersionsService: DeepMocked<ProfessionVersionsService>;
  let response: DeepMocked<Response>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();
    professionVersionsService = createMock<ProfessionVersionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulatedActivitiesController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
        {
          provide: ProfessionVersionsService,
          useValue: professionVersionsService,
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
        reservedActivities: 'Example reserved activities',
      });

      professionsService.findWithVersions.mockResolvedValue(profession);
      professionVersionsService.findWithProfession.mockResolvedValue(version);

      await controller.edit(response, 'profession-id', 'version-id', 'false');

      expect(response.render).toHaveBeenCalledWith(
        'admin/professions/regulated-activities',
        expect.objectContaining({
          regulationSummary: 'Example regulation summary',
          reservedActivities: 'Example reserved activities',
        }),
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
            reservedActivities: 'Example reserved activities',
            protectedTitles: 'Example protected titles',
            regulationUrl: 'https://example.com/regulation',
            change: false,
          };

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatedActivitiesDto,
          );

          expect(professionVersionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'version-id',
              description: 'Example regulation summary',
              reservedActivities: 'Example reserved activities',
              protectedTitles: 'Example protected titles',
              regulationUrl: 'https://example.com/regulation',
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/qualifications/edit',
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
            reservedActivities: 'Example reserved activities',
            protectedTitles: 'Example protected titles',
            regulationUrl: ' example.com/regulation',
            change: false,
          };

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatedActivitiesDto,
          );

          expect(professionVersionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'version-id',
              description: 'Example regulation summary',
              reservedActivities: 'Example reserved activities',
              protectedTitles: 'Example protected titles',
              regulationUrl: 'http://example.com/regulation',
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/qualifications/edit',
          );
        });
      });

      describe('when the "Change" query param is true', () => {
        it('updates the Profession and redirects to the Check your answers page', async () => {
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
            reservedActivities: 'Example reserved activities',
            protectedTitles: 'Example protected titles',
            regulationUrl: 'https://example.com/regulation',
            change: true,
          };

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatedActivitiesDto,
          );

          expect(professionVersionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'version-id',
              description: 'Example regulation summary',
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
    });

    describe('when required parameters are not entered', () => {
      it('does not update the profession, and re-renders the regulated activities form page with errors', async () => {
        const profession = professionFactory.build();

        const version = professionVersionFactory.build({
          id: 'version-id',
          profession: profession,
          description: 'Example regulation summary',
          reservedActivities: 'Example reserved activities',
          protectedTitles: 'Example protected titles',
          regulationUrl: 'https://example.com/regulation',
        });

        professionsService.findWithVersions.mockResolvedValue(profession);
        professionVersionsService.findWithProfession.mockResolvedValue(version);

        const regulatedActivitiesDto: RegulatedActivitiesDto = {
          regulationSummary: undefined,
          reservedActivities: undefined,
          protectedTitles: undefined,
          regulationUrl: undefined,
          change: false,
        };

        await controller.update(
          response,
          'profession-id',
          'version-id',
          regulatedActivitiesDto,
        );

        expect(professionVersionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/regulated-activities',
          expect.objectContaining({
            errors: {
              reservedActivities: {
                text: 'professions.form.errors.reservedActivities.empty',
              },
              regulationSummary: {
                text: 'professions.form.errors.regulationSummary.empty',
              },
            },
          }),
        );
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
