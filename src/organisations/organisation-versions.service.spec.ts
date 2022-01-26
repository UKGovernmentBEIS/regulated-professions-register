import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { createMock } from '@golevelup/ts-jest';

import { Repository } from 'typeorm';
import organisationVersionFactory from '../testutils/factories/organisation-version';
import { OrganisationVersion } from './organisation-version.entity';
import { OrganisationVersionsService } from './organisation-versions.service';

describe('OrganisationVersionsService', () => {
  let service: OrganisationVersionsService;
  let repo: Repository<OrganisationVersion>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganisationVersionsService,
        {
          provide: getRepositoryToken(OrganisationVersion),
          useValue: createMock<Repository<OrganisationVersion>>(),
        },
      ],
    }).compile();

    service = module.get<OrganisationVersionsService>(
      OrganisationVersionsService,
    );
    repo = module.get<Repository<OrganisationVersion>>(
      getRepositoryToken(OrganisationVersion),
    );
  });

  describe('save', () => {
    it('saves the entity', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'save')
        .mockResolvedValue(organisationVersion);
      const result = await service.save(organisationVersion);

      expect(result).toEqual(organisationVersion);
      expect(repoSpy).toHaveBeenCalledWith(organisationVersion);
    });
  });

  describe('find', () => {
    it('returns an OrganisationVersion', async () => {
      const organisationVersion = organisationVersionFactory.build();
      const repoSpy = jest
        .spyOn(repo, 'findOne')
        .mockResolvedValue(organisationVersion);
      const result = await service.find('some-uuid');

      expect(result).toEqual(organisationVersion);
      expect(repoSpy).toHaveBeenCalled();
    });
  });
});
