import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Industry } from './industry.entity';
import { IndustriesService } from './industries.service';

describe('IndustriesService', () => {
  let service: IndustriesService;
  let repo: Repository<Industry>;

  const industry = new Industry('finance');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IndustriesService,
        {
          provide: getRepositoryToken(Industry),
          useValue: {
            find: () => {
              return [industry];
            },
            findOne: () => {
              return industry;
            },
          },
        },
      ],
    }).compile();

    service = module.get<IndustriesService>(IndustriesService);
    repo = module.get<Repository<Industry>>(getRepositoryToken(Industry));
  });

  describe('all', () => {
    it('should return all Industries', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const posts = await service.all();

      expect(posts).toEqual([industry]);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return an Industry', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.find('some-uuid');

      expect(post).toEqual(industry);
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });
});
