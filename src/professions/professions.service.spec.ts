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
  ['GB-ENG', 'GB-SCT', 'GB-WLS', 'GB-NIR'],
  'Reserves of activities',
  [new Industry('Construction & Engineering')],
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
    ['GB-ENG'],
    'Protected title',
    [new Industry('Health')],
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
              return profession;
            },
            save: () => {
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
      const profession = new Profession('Example Profession');
      const repoSpy = jest.spyOn(repo, 'save');

      await service.save(profession);

      expect(repoSpy).toHaveBeenCalledWith(profession);
    });
  });

  describe('confirm', () => {
    describe('setting the slug on a Profession', () => {
      describe('when there are no colliding slugs', () => {
        it('should save the Profession with the "base" slug', async () => {
          const profession = new Profession('Example Profession');

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
            true,
          );

          expect(result.slug).toEqual('example-profession');
        });
      });

      describe('when there is a single colliding slug', () => {
        it('should save the Profession with a slug appended with "-1"', async () => {
          const profession = new Profession('Example Profession');

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
            new Profession(
              'Example Profession',
              '',
              'example-profession-1',
              '',
              null,
              '',
              null,
              null,
              null,
              null,
              true,
            ),
          );
          expect(result.slug).toEqual('example-profession-1');
        });
      });

      describe('when there are multiple colliding slugs', () => {
        it('should save the Profession with a slug appended with a unique postfix', async () => {
          const profession = new Profession('Example Profession');

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
            new Profession(
              'Example Profession',
              '',
              'example-profession-3',
              '',
              null,
              '',
              null,
              null,
              null,
              null,
              true,
            ),
          );
          expect(result.slug).toEqual('example-profession-3');
        });
      });
    });

    describe('marking the Profession as "Confirmed"', () => {
      describe('when the Profession has not yet been confirmed', () => {
        it('confirms the Profession', async () => {
          const profession = new Profession('Example Profession');

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
            const existingProfession = new Profession(
              'Example Profession',
              '',
              'example-profession-3',
              '',
              null,
              '',
              null,
              null,
              null,
              null,
              true,
            );

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
