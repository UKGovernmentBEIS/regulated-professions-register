import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Industry } from './industry.entity';
import { IndustriesService } from './industries.service';
import industryFactory from '../testutils/factories/industry';

describe('IndustriesService', () => {
  let service: IndustriesService;
  let repo: Repository<Industry>;

  const industry = industryFactory.build();

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

  describe('findByIds', () => {
    it('should return all Industries for the given IDs', async () => {
      const shippingIndustry = industryFactory.build({ name: 'Shipping' });
      const repoSpy = jest
        .spyOn(repo, 'find')
        .mockResolvedValueOnce([industry, shippingIndustry]);

      const industries = await service.findByIds(['some-uuid', 'another-uuid']);

      expect(industries).toEqual([industry, shippingIndustry]);
      expect(repoSpy).toHaveBeenCalledWith({
        where: {
          id: expect.objectContaining({
            _value: ['some-uuid', 'another-uuid'],
          }),
        },
      });
    });
  });
});
