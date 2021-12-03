import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Qualification } from './qualification.entity';
import { QualificationService } from './qualification.service';

const qualification = new Qualification(
  'ATT - Attestation of competence , Art. 11 a',
  'Accredited Certification Scheme accredited by the United Kongdom Accrediation Service UKAS in accordance with ISO EN 17024 or an approprate National/Scottish Vocational Qualification at level 2',
  'General secondary education',
  '1 Year',
  false,
);

describe('Qualification service', () => {
  let service: QualificationService;
  let repo: Repository<Qualification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QualificationService,
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

    service = module.get<QualificationService>(QualificationService);
    repo = module.get<Repository<Qualification>>(
      getRepositoryToken(Qualification),
    );
  });

  describe('all', () => {
    it('should return all Legislations', async () => {
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
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });
});
