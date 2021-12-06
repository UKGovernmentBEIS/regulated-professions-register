import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organisation } from './organisation.entity';
import { OrganisationsService } from './organisations.service';

describe('OrganisationsService', () => {
  let service: OrganisationsService;
  let repo: Repository<Organisation>;

  const organisation = new Organisation(
    'Department of Business, Energy and Industrial Strategy',
    'BEIS',
    '123 Fake Street',
    'www.beis.gov.uk',
    'beis@example.com',
    'contact-us.example.com',
    '0123456789',
    '0123456780',
    [],
  );

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

  describe('find', () => {
    it('returns an Organisation', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const organisations = await service.find('some-uuid');

      expect(organisations).toEqual(organisation);
      expect(repoSpy).toHaveBeenCalled();
    });
  });
});
