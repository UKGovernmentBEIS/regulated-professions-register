import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, EntityManager, QueryRunner, Repository } from 'typeorm';

import professionFactory from '../testutils/factories/profession';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';

const gasSafeEngineer = professionFactory.build({
  name: 'Registered Gas Engineer',
});

const professionArray = [
  gasSafeEngineer,
  professionFactory.build({ name: 'Social worker' }),
];

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
          useValue: {
            find: () => {
              return professionArray;
            },
            findOne: () => {
              return gasSafeEngineer;
            },
            save: () => {
              return gasSafeEngineer;
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
      const professions = await service.all();

      expect(professions).toEqual(professionArray);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('allConfirmed', () => {
    it('should return all confirmed Professions', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const professions = await service.allConfirmed();

      expect(professions).toEqual(professionArray);
      expect(repoSpy).toHaveBeenCalledWith({ where: { confirmed: true } });
    });
  });

  describe('find', () => {
    it('should return a Profession', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const profession = await service.find('some-uuid');

      expect(profession).toEqual(profession);
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('findBySlug', () => {
    it('should return a profession', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const profession = await service.findBySlug('some-slug');

      expect(profession).toEqual(profession);
      expect(repoSpy).toHaveBeenCalledWith({ where: { slug: 'some-slug' } });
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

          new Profession(
            'Example Profession',
            '',
            'example-profession',
            '',
            null,
            '',
            null,
            null,
            null,
            null,
            null,
            null,
            true,
          );

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
