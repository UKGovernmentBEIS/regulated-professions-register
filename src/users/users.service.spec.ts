import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  Connection,
  EntityManager,
  QueryRunner,
  Repository,
  SelectQueryBuilder,
} from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import userFactory from '../testutils/factories/user';

import { User } from './user.entity';
import { UsersService } from './users.service';
import organisationFactory from '../testutils/factories/organisation';

const user = userFactory.build();
const userArray = userFactory.buildList(2);

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
  let queryBuilder: DeepMocked<SelectQueryBuilder<User>>;
  let connection: DeepMocked<Connection>;

  beforeEach(async () => {
    queryBuilder = createMock<SelectQueryBuilder<User>>();
    connection = createMock<Connection>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: () => {
              return userArray;
            },
            findOne: () => {
              return user;
            },
            save: () => {
              return {};
            },
            createQueryBuilder: () => {
              return queryBuilder;
            },
          },
        },
        {
          provide: Connection,
          useValue: connection,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('all', () => {
    it('should return all users', async () => {
      const repoSpy = jest.spyOn(repo, 'find');
      const posts = await service.all();

      expect(posts).toEqual(userArray);
      expect(repoSpy).toHaveBeenCalled();
    });
  });

  describe('allConfirmed', () => {
    it('should return all confirmed users', async () => {
      const users = userFactory.buildList(2);

      const queryBuilder = createMock<SelectQueryBuilder<User>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => users,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      await service.allConfirmed();

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.confirmed = true AND user.archived = false',
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('LOWER(user.name)');
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('allConfirmedForOrganisation', () => {
    it('should return all confirmed users', async () => {
      const organisation = organisationFactory.build();
      const users = userFactory.buildList(2);

      const queryBuilder = createMock<SelectQueryBuilder<User>>({
        leftJoinAndSelect: () => queryBuilder,
        where: () => queryBuilder,
        andWhere: () => queryBuilder,
        orderBy: () => queryBuilder,
        getMany: async () => users,
      });

      jest
        .spyOn(repo, 'createQueryBuilder')
        .mockImplementation(() => queryBuilder);

      await service.allConfirmedForOrganisation(organisation);

      expect(queryBuilder.where).toHaveBeenCalledWith(
        'user.confirmed = true AND user.archived = false',
      );
      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        'organisation.id = :organisationId',
        {
          organisationId: organisation.id,
        },
      );
      expect(queryBuilder.orderBy).toHaveBeenCalledWith('LOWER(user.name)');
      expect(queryBuilder.getMany).toHaveBeenCalled();
    });
  });

  describe('find', () => {
    it('should return a user', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.find('some-uuid');

      expect(post).toEqual(user);
      expect(repoSpy).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('findByExternalIdentifier', () => {
    it('should return a user', async () => {
      const repoSpy = jest.spyOn(repo, 'findOne');
      const post = await service.findByExternalIdentifier(
        'external-identifier',
      );

      expect(post).toEqual(user);
      expect(repoSpy).toHaveBeenCalledWith({
        where: { externalIdentifier: 'external-identifier' },
      });
    });
  });

  describe('save', () => {
    it('should insert a user', async () => {
      const repoSpy = jest.spyOn(repo, 'save');
      await service.save(user);

      expect(repoSpy).toHaveBeenCalledWith(user);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      await service.delete('some-uuid');

      jest.spyOn(queryBuilder.delete(), 'from');
      jest.spyOn(queryBuilder.delete().from(expect.anything()), 'where');
      jest.spyOn(
        queryBuilder
          .delete()
          .from(User)
          .where(expect.anything(), expect.anything()),
        'execute',
      );

      expect(queryBuilder.delete().from).toHaveBeenCalledWith(User);
      expect(
        queryBuilder.delete().from(expect.anything()).where,
      ).toHaveBeenCalledWith('id = :id', { id: 'some-uuid' });
      expect(
        queryBuilder
          .delete()
          .from(expect.anything())
          .where(expect.anything(), expect.anything()).execute,
      ).toHaveBeenCalledTimes(1);
    });
  });

  describe('attemptAdd', () => {
    let queryRunner: DeepMocked<QueryRunner>;

    beforeEach(() => {
      queryRunner = createMock<QueryRunner>({
        manager: createMock<EntityManager>(),
      });

      jest
        .spyOn(connection, 'createQueryRunner')
        .mockImplementation(() => queryRunner);
    });

    describe('when a user with the given external identifier is not found', () => {
      it('adds a new user', async () => {
        const user = userFactory.build();

        const saveSpy = jest.spyOn(queryRunner.manager, 'save');
        const findSpy = jest
          .spyOn(queryRunner.manager, 'findOne')
          .mockResolvedValue(undefined);

        const result = await service.attemptAdd(user);

        expect(result).toEqual('user-created');

        expect(findSpy).toHaveBeenCalledWith(User, {
          externalIdentifier: user.externalIdentifier,
        });
        expect(saveSpy).toHaveBeenCalledWith(User, user);

        expect(queryRunner.commitTransaction).toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled();
      });
    });

    describe('when a user with the given external identifier is found', () => {
      it('does not add a new user', async () => {
        const user = userFactory.build();

        const saveSpy = jest.spyOn(queryRunner.manager, 'save');
        const findSpy = jest
          .spyOn(queryRunner.manager, 'findOne')
          .mockResolvedValue({});

        const result = await service.attemptAdd(user);

        expect(result).toEqual('user-exists');

        expect(findSpy).toHaveBeenCalledWith(User, {
          externalIdentifier: user.externalIdentifier,
        });
        expect(saveSpy).not.toBeCalled();

        expect(queryRunner.commitTransaction).toHaveBeenCalled();
        expect(queryRunner.release).toHaveBeenCalled();
      });
    });

    it('rolls back the transaction if an error occurs', async () => {
      const user = userFactory.build();

      const saveSpy = jest.spyOn(queryRunner.manager, 'save');
      const findSpy = jest
        .spyOn(queryRunner.manager, 'findOne')
        .mockImplementation(() => {
          throw new Error();
        });

      await expect(service.attemptAdd(user)).rejects.toThrowError();

      expect(findSpy).toHaveBeenCalledWith(User, {
        externalIdentifier: user.externalIdentifier,
      });
      expect(saveSpy).not.toBeCalled();

      expect(queryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).not.toHaveBeenCalled();
    });
  });
});
