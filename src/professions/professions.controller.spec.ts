import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Profession } from './profession.entity';

import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionsService: DeepMocked<ProfessionsService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
      ],
      controllers: [ProfessionsController],
    }).compile();

    controller = app.get<ProfessionsController>(ProfessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('show', () => {
    it('should return populated template params', async () => {
      professionsService.find.mockImplementationOnce(async () => {
        return new Profession('Example Profession');
      });

      const result = await controller.show('example-slug', 'example-id');

      expect(result).toEqual({
        professionName: 'Example Profession',
      });

      expect(professionsService.find).toBeCalledWith('example-id');
    });

    it('should throw an error when the ID does not match a profession', () => {
      professionsService.find.mockImplementationOnce(async () => {
        return null;
      });

      expect(async () => {
        await controller.show('example-slug', 'example-invalid-id');
      }).rejects.toThrowError();
    });
  });
});
