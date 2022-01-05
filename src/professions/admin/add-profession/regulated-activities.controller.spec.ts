import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { Profession } from '../../profession.entity';
import { ProfessionsService } from '../../professions.service';
import { RegulatedActivitiesController } from './regulated-activities.controller';

describe(RegulatedActivitiesController, () => {
  let controller: RegulatedActivitiesController;
  let professionsService: DeepMocked<ProfessionsService>;
  let response: DeepMocked<Response>;
  let profession: DeepMocked<Profession>;

  beforeEach(async () => {
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
      profession = createMock<Profession>({
        id: 'profession-id',
        reservedActivities: 'Example reserved activities',
        description: 'A description of the profession',
      });

      await controller.edit(response, 'profession-id');

      expect(response.render).toHaveBeenCalledWith(
        'professions/admin/add-profession/regulated-activities',
        {
          reservedActivities: 'Example reserved activities',
          regulationDescription: 'A description of the profession',
          errors: undefined,
        },
      );
    });
  });

  describe('update', () => {
    it('redirects to the "Check your answers" page', async () => {
      await controller.update(response, 'profession-id');

      expect(response.redirect).toHaveBeenCalledWith(
        '/admin/professions/profession-id/check-your-answers',
      );
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
