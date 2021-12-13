import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, EntityManager, QueryRunner, Repository } from 'typeorm';

import { Industry } from '../industries/industry.entity';
import { Qualification } from '../qualifications/qualification.entity';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';

const profession = new Profession(
  'Registered Gas Engineer',
  'Gas installer/repairer',
  'registered-gas-engineer',
  'Gas installers work on gas appliances and installations.',
  'All regions',
  'Reserves of activities',
  new Industry('Construction & Engineering'),
  new Qualification('ATT - Attestation of competence , Art. 11 a'),
  [
    'Gas Safe Register is the official list of gas engineers in the UK, Isle of Man and Guernsey. To work on gas appliances and installations you must be on the gas safe register. The register exists to protect the public from unsafe gas work (EN)',
  ],
);
const professionArray = [
  profession,
  new Profession(
    'Social worker',
    'Social worker',
    'social-worker',
    'Social workers are trained to: make assessments, taking account of a range of factors',
    'England',
    'Protected title',
    new Industry('Health'),
    new Qualification(
      'PS3 - Diploma of post-secondary level (3-4 years) , Art. 11 d',
    ),
    [
      'England, must be registered with the Health and Care Professions Council (HCPC)',
      'Northern Ireland, must be registered with the Northern Ireland Social Care Council (NISCC)',
    ],
  ),
];

describe('Profession', () => {
  let service: ProfessionsService;
  let repo: Repository<Profession>;
  let manager: DeepMocked<EntityManager>;

  beforeEach(async () => {
    const queryRunner = createMock<QueryRunner>();
    const connection = createMock<Connection>();

    manager = createMock<EntityManager>();
    Object.assign(queryRunner, { manager });

    connection.createQueryRunner.mockReturnValue(queryRunner);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionsService,
        {
          provide: getRepositoryToken(Profession),
          useValue: {
            find: () => {
              return professionArray;
            },
            findOne: () => {
              return profession;
            },
          },
        },
        {
          provide: Connection,
          useValue: connection,
        },
      ],
    }).compile();

    service = module.get<ProfessionsService>(ProfessionsService);
    repo = module.get<Repository<Profession>>(getRepositoryToken(Profession));
  });

  describe('all', () => {
    it('should return all Professions', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const posts = await service.all();

      expect(posts).toEqual(professionArray);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return a Profession', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.find('some-uuid');

      expect(post).toEqual(profession);
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('findBySlug', () => {
    it('should return a profession', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.findBySlug('some-slug');

      expect(post).toEqual(profession);
      expect(repoSpy).toHaveBeenCalledWith({ where: { slug: 'some-slug' } });
    });
  });

  describe('replaceSlugAndAdd', () => {
    it('should save the profession with the "base" slug when there are no colliding slugs', async () => {
      const profession = new Profession();
      profession.name = 'Example Profession';

      manager.findOne.mockReturnValue(null);

      const result = await service.replaceSlugAndAdd(profession);

      expect(manager.findOne).toBeCalledTimes(1);

      expect(manager.findOne).toBeCalledWith(Profession, {
        where: { slug: 'example-profession' },
      });

      expect(manager.save).toHaveBeenCalledWith(
        new Profession('Example Profession', '', 'example-profession'),
      );
      expect(result.slug).toEqual('example-profession');
    });

    it('should save the profession with a slug appended with "-1" when there is a colliding slug', async () => {
      const profession = new Profession();
      profession.name = 'Example Profession';

      manager.findOne
        .mockImplementationOnce(async () => {
          return new Profession();
        })
        .mockReturnValue(null);

      const result = await service.replaceSlugAndAdd(profession);

      expect(manager.findOne).toBeCalledTimes(2);

      expect(manager.findOne).toBeCalledWith(Profession, {
        where: { slug: 'example-profession' },
      });
      expect(manager.findOne).toBeCalledWith(Profession, {
        where: { slug: 'example-profession-1' },
      });

      expect(manager.save).toHaveBeenCalledWith(
        new Profession('Example Profession', '', 'example-profession-1'),
      );
      expect(result.slug).toEqual('example-profession-1');
    });

    it('should save the profession with a slug appended with a unique postfix where there are multiple colliding slugs', async () => {
      const profession = new Profession();
      profession.name = 'Example Profession';

      manager.findOne
        .mockImplementationOnce(async () => {
          return new Profession();
        })
        .mockImplementationOnce(async () => {
          return new Profession();
        })
        .mockImplementationOnce(async () => {
          return new Profession();
        })
        .mockReturnValue(null);

      const result = await service.replaceSlugAndAdd(profession);

      expect(manager.findOne).toBeCalledTimes(4);

      expect(manager.findOne).toBeCalledWith(Profession, {
        where: { slug: 'example-profession' },
      });
      expect(manager.findOne).toBeCalledWith(Profession, {
        where: { slug: 'example-profession-1' },
      });
      expect(manager.findOne).toBeCalledWith(Profession, {
        where: { slug: 'example-profession-2' },
      });
      expect(manager.findOne).toBeCalledWith(Profession, {
        where: { slug: 'example-profession-3' },
      });

      expect(manager.save).toHaveBeenCalledWith(
        new Profession('Example Profession', '', 'example-profession-3'),
      );
      expect(result.slug).toEqual('example-profession-3');
    });
  });
});
