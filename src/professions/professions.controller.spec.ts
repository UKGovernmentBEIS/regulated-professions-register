import { Test, TestingModule } from '@nestjs/testing';

import { ProfessionsController } from './professions.controller';

describe('ProfessionsController', () => {
  let controller: ProfessionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfessionsController],
    }).compile();

    controller = module.get<ProfessionsController>(ProfessionsController);
  });

  describe('new', () => {
    it('should return an empty object', () => {
      expect(controller.new()).toEqual({});
    });
  });
});
