import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, EntityManager, QueryRunner, Repository } from 'typeorm';
import { SlugGenerator } from '../common/slug-generator';

import professionFactory from '../testutils/factories/profession';
import professionVersionFactory from '../testutils/factories/profession-version';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';

jest.mock('../common/slug-generator');

describe('Profession', () => {
  let service: ProfessionsService;
  let repo: Repository<Profession>;
  let manager: DeepMocked<EntityManager>;

  beforeEach(async () => {
    manager = createMock<EntityManager>();

    const queryRunner = createMock<QueryRunner>({ manager });
    const connection = createMock<Connection>();

    connection.createQueryRunner.mockReturnValue(queryRunner);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfessionsService,
        {
          provide: getRepositoryToken(Profession),
          useValue: createMock<Repository<Profession>>(),
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
    it('should return all Professions, sorted by name', async () => {
      const professions = professionFactory.buildList(2);
      const repoSpy = jest.spyOn(repo, 'find').mockResolvedValue(professions);

      expect(service.all()).resolves.toEqual(professions);
      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          order: { name: 'ASC' },
        }),
      );
    });
  });

  describe('allConfirmed', () => {
    it('should return all confirmed Professions, sorted by name', async () => {
      const professions = professionFactory.buildList(2);
      const repoSpy = jest.spyOn(repo, 'find').mockResolvedValue(professions);

      expect(service.allConfirmed()).resolves.toEqual(professions);
      expect(repoSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { confirmed: true },
          order: { name: 'ASC' },
        }),
      );
    });
  });

  describe('find', () => {
    it('should return a Profession', async () => {
      const profession = professionFactory.build({ id: 'some-uuid' });
      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(profession);

      expect(service.find('some-uuid')).resolves.toEqual(profession);
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('findBySlug', () => {
    it('should return a profession', async () => {
      const profession = professionFactory.build({ slug: 'some-slug' });
      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(profession);

      expect(service.findBySlug('some-slug')).resolves.toEqual(profession);
      expect(repoSpy).toHaveBeenCalledWith({ where: { slug: 'some-slug' } });
    });
  });

  describe('findWithVersions', () => {
    it('should return a profession with its versions', async () => {
      const profession = professionFactory.build({
        id: 'profession-id',
        versions: professionVersionFactory.buildList(2),
      });
      const repoSpy = jest.spyOn(repo, 'findOne').mockResolvedValue(profession);

      expect(service.findWithVersions('profession-id')).resolves.toEqual(
        profession,
      );
      expect(repoSpy).toHaveBeenCalledWith('profession-id', {
        relations: ['versions'],
      });
    });
  });

  describe('save', () => {
    it('should save a Profession', async () => {
      const profession = professionFactory.build();
      const repoSpy = jest.spyOn(repo, 'save');

      await service.save(profession);

      expect(repoSpy).toHaveBeenCalledWith(profession);
    });
  });

  describe('setSlug', () => {
    it('sets a slug on the organisation', async () => {
      SlugGenerator.prototype.slug = async () => 'slug';

      const profession = professionFactory.build();
      const repoSpy = jest.spyOn(repo, 'save').mockResolvedValue({
        ...profession,
        slug: 'slug',
      });

      const result = await service.setSlug(profession);

      expect(result).toEqual({
        ...profession,
        slug: 'slug',
      });
      expect(repoSpy).toHaveBeenCalledWith({
        ...profession,
        slug: 'slug',
      });
    });
  });
});
