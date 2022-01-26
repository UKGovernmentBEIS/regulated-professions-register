import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';

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
        OrganisationsService,
        {
          provide: getRepositoryToken(Organisation),
          useValue: createMock<Repository<Organisation>>(),
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

    it('should return all Organisations', async () => {
      repoSpy = jest.spyOn(repo, 'find').mockResolvedValue([organisation]);
      organisations = await service.all();

      expect(organisations).toEqual([organisation]);
      expect(repoSpy).toHaveBeenCalled();
    });

    it('Organisations should be sorted', async () => {
      repoSpy = jest.spyOn(repo, 'find').mockResolvedValue([organisation]);
      organisations = await service.all();

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

    it('returns all Organisations, populated with confirmed Professions', async () => {
      repoSpy = jest.spyOn(repo, 'find').mockResolvedValue([organisation]);
      organisations = await service.allWithProfessions();

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

    it('Organisations should be sorted', async () => {
      repoSpy = jest.spyOn(repo, 'find').mockResolvedValue([organisation]);
      organisations = await service.allWithProfessions();

      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
    });
  });

  describe('find', () => {
    it('returns an Organisation', async () => {
      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(organisation);
      const foundOrganisation = await service.find('some-uuid');

      expect(foundOrganisation).toEqual(organisation);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('findBySlug', () => {
    it('should return an Organisation', async () => {
      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(organisation);
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

      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(organisation);
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
      const repoSpy = jest.spyOn(repo, 'save').mockResolvedValue(organisation);

      await service.save(organisation);

      expect(repoSpy).toHaveBeenCalledWith(organisation);
    });
  });
});
