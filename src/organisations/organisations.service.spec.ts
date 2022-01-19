import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import organisationFactory from '../testutils/factories/organisation';
import professionFactory from '../testutils/factories/profession';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let repo: Repository<Organisation>;

  const confirmedProfession = professionFactory.build({ confirmed: true });
  const unconfirmedProfession = professionFactory.build({ confirmed: false });

  const organisation = organisationFactory.build({
    professions: [confirmedProfession, unconfirmedProfession],
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Rebuild organisations on each call to our mock repository, as they
        // are potentially mutated by OrganisationsService
        OrganisationsService,
        {
          provide: getRepositoryToken(Organisation),
          useValue: {
            find: () => {
              return [organisationFactory.build(organisation)];
            },
            findOne: () => {
              return organisationFactory.build(organisation);
            },
            save: () => {
              return organisationFactory.build(organisation);
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

    it('returns all Organisations, populated with confirmed Professions', async () => {
      const expected = [
        organisationFactory.build({
          ...organisation,
          professions: [confirmedProfession],
        }),
      ];

      expect(organisations).toEqual(expected);
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
      const foundOrganisation = await service.find('some-uuid');

      expect(foundOrganisation).toEqual(organisation);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should return an Organisation', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const foundOrganisation = await service.findBySlug('some-slug');

      expect(foundOrganisation).toEqual(organisation);
      expect(repoSpy).toHaveBeenCalledWith({
        where: { slug: 'some-slug' },
      });
    });
  });

  describe('findBySlugWithProfessions', () => {
    it('should return an Organisation, populated with confirmed Professions', async () => {
      const expected = organisationFactory.build({
        ...organisation,
        professions: [confirmedProfession],
      });

      const repoSpy = jest.spyOn(repo, 'findOne');
      const foundOrganisation = await service.findBySlugWithProfessions(
        'some-slug',
      );

      expect(foundOrganisation).toEqual(expected);
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
