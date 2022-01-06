import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import legislationFactory from '../testutils/factories/legislation';

import { Legislation } from './legislation.entity';
import { LegislationsService } from './legislations.service';

const legislation = legislationFactory.build();
const legislationArray = legislationFactory.buildList(2);

describe('LegislationsService', () => {
  let service: LegislationsService;
  let repo: Repository<Legislation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegislationsService,
        {
          provide: getRepositoryToken(Legislation),
          useValue: {
            find: () => {
              return legislationArray;
            },
            findOne: () => {
              return legislation;
            },
          },
        },
      ],
    }).compile();

    service = module.get<LegislationsService>(LegislationsService);
    repo = module.get<Repository<Legislation>>(getRepositoryToken(Legislation));
  });

  describe('all', () => {
    it('should return all Legislations', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const posts = await service.all();

      expect(posts).toEqual(legislationArray);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return a Legislation', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.find('some-uuid');

      expect(post).toEqual(legislation);
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });
});
