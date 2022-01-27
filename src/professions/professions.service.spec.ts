import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, EntityManager, QueryRunner, Repository } from 'typeorm';

import professionFactory from '../testutils/factories/profession';
import professionVersionFactory from '../testutils/factories/profession-version';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';

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

  describe('confirm', () => {
    describe('setting the slug on a Profession', () => {
      describe('when there are no colliding slugs', () => {
        it('should save the Profession with the "base" slug', async () => {
          const profession = professionFactory.build();

          manager.findOne.mockReturnValue(null);

          const result = await service.confirm(profession);

          expect(manager.findOne).toBeCalledTimes(1);

          expect(manager.findOne).toBeCalledWith(Profession, {
            where: { slug: 'example-profession' },
          });

          expect(result.slug).toEqual('example-profession');
        });
      });

      describe('when there is a single colliding slug', () => {
        it('should save the Profession with a slug appended with "-1"', async () => {
          const profession = professionFactory.build();

          manager.findOne
            .mockImplementationOnce(async () => {
              return new Profession();
            })
            .mockReturnValue(null);

          const result = await service.confirm(profession);

          expect(manager.findOne).toBeCalledTimes(2);

          expect(manager.findOne).toBeCalledWith(Profession, {
            where: { slug: 'example-profession' },
          });
          expect(manager.findOne).toBeCalledWith(Profession, {
            where: { slug: 'example-profession-1' },
          });

          expect(manager.save).toHaveBeenCalledWith(
            expect.objectContaining({
              slug: 'example-profession-1',
            }),
          );
          expect(result.slug).toEqual('example-profession-1');
        });
      });

      describe('when there are multiple colliding slugs', () => {
        it('should save the Profession with a slug appended with a unique postfix', async () => {
          const profession = professionFactory.build();

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

          const result = await service.confirm(profession);

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
            expect.objectContaining({
              slug: 'example-profession-3',
            }),
          );
          expect(result.slug).toEqual('example-profession-3');
        });
      });
    });

    describe('marking the Profession as "Confirmed"', () => {
      describe('when the Profession has not yet been confirmed', () => {
        it('confirms the Profession', async () => {
          const profession = professionFactory.build();

          manager.findOne
            .mockImplementationOnce(async () => {
              return profession;
            })
            .mockResolvedValue(null);

          const result = await service.confirm(profession);

          expect(result.confirmed).toEqual(true);
        });

        describe('when the Profession has already been confirmed', () => {
          it('throws an error', async () => {
            const existingProfession = professionFactory.build({
              confirmed: true,
            });

            manager.findOne
              .mockImplementationOnce(async () => {
                return existingProfession;
              })
              .mockResolvedValue(null);

            await expect(async () =>
              service.confirm(existingProfession),
            ).rejects.toThrowError('Profession has already been confirmed');

            expect(manager.save).not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
