import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import professionFactory from '../../testutils/factories/profession';
import { ProfessionsService } from '../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesController } from './regulated-activities.controller';

describe(RegulatedActivitiesController, () => {
  let controller: RegulatedActivitiesController;
  let professionsService: DeepMocked<ProfessionsService>;
  let response: DeepMocked<Response>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegulatedActivitiesController],
      providers: [
        { provide: ProfessionsService, useValue: professionsService },
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
        reservedActivities: 'Example reserved activities',
        description: 'A description of the profession',
      });

      professionsService.findWithVersions.mockResolvedValue(profession);

      await controller.edit(response, 'profession-id', 'version-id', false);

      expect(response.render).toHaveBeenCalledWith(
        'admin/professions/regulated-activities',
        expect.objectContaining({
          reservedActivities: 'Example reserved activities',
          regulationDescription: 'A description of the profession',
        }),
      );
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      describe('when the "Change" query param is false', () => {
        it('updates the Profession and redirects to the next page in the journey', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          professionsService.findWithVersions.mockResolvedValue(profession);

          const regulatedActivitiesDto: RegulatedActivitiesDto = {
            activities: 'Example reserved activities',
            description: 'A description of the profession',
            change: false,
          };

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatedActivitiesDto,
          );

          expect(professionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'profession-id',
              description: 'A description of the profession',
              reservedActivities: 'Example reserved activities',
            }),
          );

          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/versions/version-id/qualification-information/edit',
          );
        });
      });

      describe('when the "Change" query param is true', () => {
        it('updates the Profession and redirects to the Check your answers page', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          professionsService.findWithVersions.mockResolvedValue(profession);

          const regulatedActivitiesDto: RegulatedActivitiesDto = {
            activities: 'Example reserved activities',
            description: 'A description of the profession',
            change: true,
          };

          await controller.update(
            response,
            'profession-id',
            'version-id',
            regulatedActivitiesDto,
          );

          expect(professionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'profession-id',
              description: 'A description of the profession',
              reservedActivities: 'Example reserved activities',
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

        professionsService.findWithVersions.mockResolvedValue(profession);

        const regulatedActivitiesDto: RegulatedActivitiesDto = {
          activities: undefined,
          description: undefined,
          change: false,
        };

        await controller.update(
          response,
          'profession-id',
          'version-id',
          regulatedActivitiesDto,
        );

        expect(professionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'admin/professions/regulated-activities',
          expect.objectContaining({
            errors: {
              activities: {
                text: 'professions.form.errors.reservedActivities.empty',
              },
              description: {
                text: 'professions.form.errors.description.empty',
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
