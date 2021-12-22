import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository, SelectQueryBuilder } from 'typeorm';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

import { User } from './user.entity';
import { UsersService } from './users.service';

const user = new User('email@example.com', 'name', '212121');
const userArray = [user, new User('email2@example.com', 'name2', '1234')];

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;
  let queryBuilder: DeepMocked<SelectQueryBuilder<User>>;

  beforeEach(async () => {
    queryBuilder = createMock<SelectQueryBuilder<User>>();

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
          useValue: {},
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

  describe('where', () => {
    it('should search for a user given a query', async () => {
      const query = { email: 'foo@bar.com' };
      const repoSpy = jest.spyOn(repo, 'find');
      const post = await service.where(query);

      expect(post).toEqual(userArray);
      expect(repoSpy).toHaveBeenCalledWith({ where: query });
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
});
