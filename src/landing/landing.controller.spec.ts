import { Test, TestingModule } from '@nestjs/testing';
import { LandingController } from './landing.controller';

describe('LandingController', () => {
  let landingController: LandingController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [LandingController],
    }).compile();

    landingController = app.get<LandingController>(LandingController);
  });

  describe('index', () => {
    it('return without error', () => {
      expect(landingController.index()).toEqual(undefined);
    });
  });
});
