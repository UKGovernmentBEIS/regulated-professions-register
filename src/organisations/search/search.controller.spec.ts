import { DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { createMockRequest } from '../../testutils/create-mock-request';
import { IndexTemplate } from './interfaces/index-template.interface';
import { SearchController } from './search.controller';

const referrer = 'http://example.com/some/path';
const host = 'example.com';

describe('SearchController', () => {
  let request: DeepMocked<Request>;

  let controller: SearchController;

  beforeEach(async () => {
    request = createMockRequest(referrer, host);

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
      const result = await controller.index(request);

      const expected: IndexTemplate = {
        backLink: 'http://example.com/some/path',
      };

      expect(result).toEqual(expected);
    });
  });
});
