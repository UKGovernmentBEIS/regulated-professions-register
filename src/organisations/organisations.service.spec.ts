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
            save: () => {
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
    let repoSpy: jest.SpyInstance<Promise<Organisation[]>>;
    let organisations: Organisation[];

    beforeEach(async () => {
      repoSpy = jest.spyOn(repo, 'find');
      organisations = await service.all();
    });

    it('should return all Organisations', async () => {
      expect(organisations).toEqual([organisation]);
      expect(repoSpy).toHaveBeenCalled();
    });

    it('Organisations should be sorted', () => {
      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
    });
  });

  describe('allWithProfessions', () => {
    let repoSpy: jest.SpyInstance<Promise<Organisation[]>>;
    let organisations: Organisation[];

    beforeEach(async () => {
      repoSpy = jest.spyOn(repo, 'find');
      organisations = await service.allWithProfessions();
    });

    it('returns all Organisations, populated with Professions', async () => {
      expect(organisations).toEqual([organisation]);
      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          relations: ['professions'],
        }),
      );
    });

    it('Organisations should be sorted', () => {
      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
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

  describe('findBySlug', () => {
    it('should return an Organisation', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const organisation = await service.findBySlug('some-slug');

      expect(organisation).toEqual(organisation);
      expect(repoSpy).toHaveBeenCalledWith({
        where: { slug: 'some-slug' },
      });
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

  describe('save', () => {
    it('should save an Organisation', async () => {
      const organisation = organisationFactory.build();
      const repoSpy = jest.spyOn(repo, 'save');

      await service.save(organisation);

      expect(repoSpy).toHaveBeenCalledWith(organisation);
    });
  });
});
