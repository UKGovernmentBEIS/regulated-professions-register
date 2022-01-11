import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import organisationFactory from '../testutils/factories/organisation';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let repo: Repository<Organisation>;

  const organisation = organisationFactory.build();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationsService,
        {
          provide: getRepositoryToken(Organisation),
          useValue: {
            find: () => {
              return [organisation];
            },
            findOne: () => {
              return organisation;
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrganisationsService>(OrganisationsService);
    repo = module.get<Repository<Organisation>>(
      getRepositoryToken(Organisation),
    );
  });

  describe('all', () => {
    it('returns all Organisations', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const organisations = await service.all();

      expect(organisations).toEqual([organisation]);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('allWithProfessions', () => {
    it('returns all Organisations, populated with Professions', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const organisations = await service.allWithProfessions();

      expect(organisations).toEqual([organisation]);
      expect(repoSpy).toHaveBeenCalledWith({ relations: ['professions'] });
    });
  });

  describe('find', () => {
    it('returns an Organisation', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const organisations = await service.find('some-uuid');

      expect(organisations).toEqual(organisation);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('findBySlugWithProfessions', () => {
    it('should return an Organisation, populated with Professions', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const organisation = await service.findBySlugWithProfessions('some-slug');

      expect(organisation).toEqual(organisation);
      expect(repoSpy).toHaveBeenCalledWith({
        where: { slug: 'some-slug' },
        relations: ['professions'],
      });
    });
  });
});
