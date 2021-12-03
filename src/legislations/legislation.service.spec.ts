import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Legislation } from './legislation.entity';
import { LegislationService } from './legislation.service';

const legislation = new Legislation(
  'Gas Safety (Installation and Use ) Regulations 1998',
  'http://www.legislation.gov.uk/uksi/1998/2451/made',
);
const legislationArray = [
  legislation,
  new Legislation(
    'Health and Social Work Professions Order 2001.',
    'http://www.hcpc-uk.org/aboutus/legislation/',
  ),
];

describe('Profession', () => {
  let service: LegislationService;
  let repo: Repository<Legislation>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegislationService,
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

    service = module.get<LegislationService>(LegislationService);
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
