import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import professionFactory from '../../../testutils/factories/profession';
import { ProfessionsService } from '../../professions.service';
import { RegulatedActivitiesDto } from './dto/regulated-activities.dto';
import { RegulatedActivitiesController } from './regulated-activities.controller';

describe(RegulatedActivitiesController, () => {
  let controller: RegulatedActivitiesController;
  let professionsService: DeepMocked<ProfessionsService>;
  let response: DeepMocked<Response>;

  beforeEach(async () => {
    const profession = professionFactory.build();

    professionsService = createMock<ProfessionsService>({
      find: async () => profession,
    });

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

      professionsService.find.mockImplementation(async () => profession);

      await controller.edit(response, 'profession-id', false);

      expect(response.render).toHaveBeenCalledWith(
        'professions/admin/add-profession/regulated-activities',
        expect.objectContaining({
          reservedActivities: 'Example reserved activities',
          regulationDescription: 'A description of the profession',
        }),
      );
    });

    describe('back links', () => {
      describe('when the "Change" query param is false', () => {
        it('links back to the previous page in the journey', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.find.mockImplementation(async () => profession);

          await controller.edit(response, 'profession-id', false);

          expect(response.render).toHaveBeenCalledWith(
            'professions/admin/add-profession/regulated-activities',
            expect.objectContaining({
              backLink: '/admin/professions/profession-id/regulatory-body/edit',
            }),
          );
        });
      });

      describe('when the "Change" query param is true', () => {
        it('links back to the Check your Answers page', async () => {
          const profession = professionFactory.build({
            id: 'profession-id',
          });

          professionsService.find.mockImplementation(async () => profession);

          await controller.edit(response, 'profession-id', true);

          expect(response.render).toHaveBeenCalledWith(
            'professions/admin/add-profession/regulated-activities',
            expect.objectContaining({
              backLink: '/admin/professions/profession-id/check-your-answers',
            }),
          );
        });
      });
    });
  });

  describe('update', () => {
    describe('when all required parameters are entered', () => {
      describe('when the "Change" query param is false', () => {
        it('updates the Profession and redirects to the next page in the journey', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          professionsService.find.mockImplementation(async () => profession);

          const regulatedActivitiesDto: RegulatedActivitiesDto = {
            activities: 'Example reserved activities',
            description: 'A description of the profession',
            change: false,
          };

          await controller.update(
            response,
            'profession-id',
            regulatedActivitiesDto,
          );

          expect(professionsService.save).toHaveBeenCalledWith(
            expect.objectContaining({
              id: 'profession-id',
              description: 'A description of the profession',
              reservedActivities: 'Example reserved activities',
            }),
          );

          // This will be the Qualification information page in future
          expect(response.redirect).toHaveBeenCalledWith(
            '/admin/professions/profession-id/check-your-answers',
          );
        });
      });

      describe('when the "Change" query param is true', () => {
        it('updates the Profession and redirects to the Check your answers page', async () => {
          const profession = professionFactory.build({ id: 'profession-id' });

          professionsService.find.mockImplementation(async () => profession);

          const regulatedActivitiesDto: RegulatedActivitiesDto = {
            activities: 'Example reserved activities',
            description: 'A description of the profession',
            change: true,
          };

          await controller.update(
            response,
            'profession-id',
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
            '/admin/professions/profession-id/check-your-answers',
          );
        });
      });
    });

    describe('when required parameters are not entered', () => {
      it('does not update the profession, and re-renders the regulated activities form page with errors', async () => {
        const profession = professionFactory.build();

        professionsService.find.mockImplementation(async () => profession);

        const regulatedActivitiesDto: RegulatedActivitiesDto = {
          activities: 'Example reserved activities',
          description: undefined,
          change: false,
        };

        await controller.update(
          response,
          'profession-id',
          regulatedActivitiesDto,
        );

        expect(professionsService.save).not.toHaveBeenCalled();

        expect(response.render).toHaveBeenCalledWith(
          'professions/admin/add-profession/regulated-activities',
          expect.objectContaining({
            reservedActivities: 'Example reserved activities',
            errors: {
              description: {
                text: 'description should not be empty',
              },
            },
          }),
        );
      });
    });

    describe('getPreviouslyEnteredReservedActivitiesFromDtoThenProfession', () => {
      describe('when there is an existing Profession with ReservedActivities and new params are submitted', () => {
        it('returns the dto value, over the Profession', () => {
          const profession = professionFactory.build({
            reservedActivities: 'Older reserved activities',
          });

          const regulatoryBodyDtoWithNewReservedActivities: RegulatedActivitiesDto =
            {
              activities: 'Newer reserved activities',
              description: undefined,
              change: false,
            };

          expect(
            controller.getPreviouslyEnteredReservedActivitiesFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithNewReservedActivities,
            ),
          ).toEqual('Newer reserved activities');
        });
      });

      describe('when there is an existing Profession with ReservedActivities and empty params are submitted', () => {
        it('returns the Profession value, not overwriting it', () => {
          const profession = professionFactory.build({
            reservedActivities: 'Older reserved activities',
          });

          const regulatoryBodyDtoWithMissingReservedActivities: RegulatedActivitiesDto =
            {
              activities: undefined,
              description: 'Example description',
              change: false,
            };

          expect(
            controller.getPreviouslyEnteredReservedActivitiesFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithMissingReservedActivities,
            ),
          ).toEqual('Older reserved activities');
        });
      });
    });

    describe('getPreviouslyEnteredDescriptionFromDtoThenProfession ', () => {
      describe('when there is an existing Profession with a Description and new params are submitted', () => {
        it('returns the dto value, over the Profession', () => {
          const profession = professionFactory.build({
            description: 'Older description',
          });

          const regulatoryBodyDtoWithNewDescription: RegulatedActivitiesDto = {
            description: 'Newer description',
            activities: undefined,
            change: false,
          };

          expect(
            controller.getPreviouslyEnteredDescriptionFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithNewDescription,
            ),
          ).toEqual('Newer description');
        });
      });

      describe('when there is an existing Profession with Description and empty params are submitted', () => {
        it('returns the Profession value, not overwriting it', () => {
          const profession = professionFactory.build({
            description: 'Older description',
          });

          const regulatoryBodyDtoWithMissingDescription: RegulatedActivitiesDto =
            {
              description: undefined,
              activities: undefined,
              change: false,
            };

          expect(
            controller.getPreviouslyEnteredDescriptionFromDtoThenProfession(
              profession,
              regulatoryBodyDtoWithMissingDescription,
            ),
          ).toEqual('Older description');
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
