import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { LegislationController } from './legislation.controller';

describe(LegislationController, () => {
  let controller: LegislationController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegislationController],
      providers: [],
    }).compile();

    controller = module.get<LegislationController>(LegislationController);
  });

  describe('edit', () => {
    it('renders a page with a back link', async () => {
      expect(await controller.edit('profession-id')).toEqual({
        backLink:
          '/admin/professions/profession-id/qualification-information/edit',
      });
    });
  });

  describe('update', () => {
    it('redirects to Check your answers', async () => {
      const response = createMock<Response>();

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
