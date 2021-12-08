import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Profession } from './profession.entity';

import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';
import { Response } from 'express';
import { NotFoundException } from '@nestjs/common';

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
    let res: DeepMocked<Response>;

    beforeEach(() => {
      res = createMock<Response>();
    });

    it('should render a professions details page', async () => {
      professionsService.find.mockImplementationOnce(async () => {
        return new Profession('Example Profession');
      });

      await controller.show('example-profession', 'example-id', res);

      expect(res.render).toBeCalledWith('professions/show', {
        professionName: 'Example Profession',
      });

      expect(professionsService.find).toBeCalledWith('example-id');
    });

    it('should redirect when the provided slug does not match the expected slug', async () => {
      professionsService.find.mockImplementationOnce(async () => {
        return new Profession('Example Profession');
      });

      await controller.show('unexpected-slug', 'example-id', res);

      expect(res.redirect).toBeCalledWith(
        301,
        '/professions/example-profession/example-id',
      );

      expect(professionsService.find).toBeCalledWith('example-id');
    });

    it('should throw an error when the ID does not match a profession', () => {
      professionsService.find.mockImplementationOnce(async () => {
        return null;
      });

      expect(async () => {
        await controller.show('example-profession', 'example-invalid-id', res);
      }).rejects.toThrowError(NotFoundException);
    });
  });
});
