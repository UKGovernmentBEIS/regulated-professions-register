import { Test, TestingModule } from '@nestjs/testing';
import { IndexTemplate } from './interfaces/index-template.interface';
import { SearchController } from './search.controller';

describe('SearchController', () => {
  let controller: SearchController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchController],
    }).compile();

    controller = module.get<SearchController>(SearchController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should return populated template params', async () => {
      const result = await controller.index();

      const expected: IndexTemplate = {
        backLink: '/select-service',
      };

      expect(result).toEqual(expected);
    });
  });
});
