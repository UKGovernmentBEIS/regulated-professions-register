import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import qualificationFactory from '../testutils/factories/qualification';

import { Qualification } from './qualification.entity';
import { QualificationsService } from './qualifications.service';

const qualification = qualificationFactory.build();

describe('Qualification service', () => {
  let service: QualificationsService;
  let repo: Repository<Qualification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualificationsService,
        {
          provide: getRepositoryToken(Qualification),
          useValue: {
            find: () => {
              return [qualification];
            },
            findOne: () => {
              return qualification;
            },
          },
        },
      ],
    }).compile();

    service = module.get<QualificationsService>(QualificationsService);
    repo = module.get<Repository<Qualification>>(
      getRepositoryToken(Qualification),
    );
  });

  describe('all', () => {
    it('should return all Qualifications', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const posts = await service.all();

      expect(posts).toEqual([qualification]);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return a Qualification', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.find('some-uuid');

      expect(post).toEqual(qualification);
      expect(repoSpy).toHaveBeenCalledWith({ where: { id: 'some-uuid' } });
    });
  });
});
