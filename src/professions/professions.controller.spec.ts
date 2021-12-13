import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Profession } from './profession.entity';

import { ProfessionsController } from './professions.controller';
import { ProfessionsService } from './professions.service';

const exampleProfession = new Profession('Example Profession');

describe('ProfessionsController', () => {
  let controller: ProfessionsController;
  let professionsService: DeepMocked<ProfessionsService>;

  beforeEach(async () => {
    professionsService = createMock<ProfessionsService>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfessionsService,
          useValue: professionsService,
        },
      ],
      controllers: [ProfessionsController],
    }).compile();

    controller = module.get<ProfessionsController>(ProfessionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('new', () => {
    it('should return an empty object', () => {
      expect(controller.new()).toEqual({});
    });
  });

  describe('show', () => {
    it('should return populated template params', async () => {
      professionsService.findBySlug.mockImplementationOnce(
        async () => exampleProfession,
      );

      const result = await controller.show('example-slug');

      expect(result).toEqual({
        profession: exampleProfession,
        backUrl: '',
      });

      expect(professionsService.findBySlug).toBeCalledWith('example-slug');
    });

    it('should throw an error when the slug does not match a profession', () => {
      professionsService.findBySlug.mockImplementationOnce(async () => {
        return null;
      });

      expect(async () => {
        await controller.show('example-invalid-slug');
      }).rejects.toThrowError(NotFoundException);
    });
  });
});
