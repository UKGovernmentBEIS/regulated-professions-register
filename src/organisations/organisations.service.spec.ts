import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';

import { Repository } from 'typeorm';
import organisationFactory from '../testutils/factories/organisation';
import organisationVersionFactory from '../testutils/factories/organisation-version';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';
import { SlugGenerator } from '../common/slug-generator';

jest.mock('../common/slug-generator');

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

  describe('findWithVersion', () => {
    it('returns an Organisation with version data', async () => {
      const versionAttributes = {
        alternateName: 'Alternate Organisation Name',
        address: '123 Fake Street, London, AB1 2AB, England',
        url: 'https://www.example-org.com',
        email: 'hello@example-org.com',
        telephone: '+441234567890',
      };
      const version = organisationVersionFactory.build(versionAttributes);

      const organisation = organisationFactory.build({
        versions: [version, organisationVersionFactory.build()],
      });

      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(organisation);

      const result = await service.findWithVersion(organisation.id, version.id);

      expect(result).toEqual(
        expect.objectContaining({
          ...versionAttributes,
          id: organisation.id,
          versionId: version.id,
        }),
      );

      expect(repoSpy).toHaveBeenCalledWith({
        relations: ['versions'],
        where: { id: organisation.id },
      });
    });

    it('raises a NotFoundException if the organisation cannot be found', async () => {
      jest.spyOn(repo, 'findOne').mockResolvedValue(undefined);

      await expect(async () => {
        await service.findWithVersion(organisation.id, '1234');
      }).rejects.toThrow(NotFoundException);
    });

    it('raises a NotFoundException if the version cannot be found', async () => {
      const organisation = organisationFactory.build({
        versions: [organisationVersionFactory.build()],
      });

      jest.spyOn(repo, 'findOne').mockResolvedValue(organisation);

      await expect(async () => {
        await service.findWithVersion(organisation.id, '1234');
      }).rejects.toThrow(NotFoundException);
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

  describe('save', () => {
    it('should save an Organisation', async () => {
      const organisation = organisationFactory.build();
      const repoSpy = jest.spyOn(repo, 'save').mockResolvedValue(organisation);

      await service.save(organisation);

      expect(repoSpy).toHaveBeenCalledWith(organisation);
    });
  });

  describe('setSlug', () => {
    it('sets a slug on the organisation', async () => {
      SlugGenerator.prototype.slug = async () => 'slug';

      const organisation = organisationFactory.build();
      const repoSpy = jest.spyOn(repo, 'save').mockResolvedValue({
        ...organisation,
        slug: 'slug',
      });

      const result = await service.setSlug(organisation);

      expect(result).toEqual({
        ...organisation,
        slug: 'slug',
      });
      expect(repoSpy).toHaveBeenCalledWith({
        ...organisation,
        slug: 'slug',
      });
    });
  });
});
