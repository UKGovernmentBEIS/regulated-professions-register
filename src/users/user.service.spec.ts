import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { UserService } from './user.service';

const user = new User('email@example.com', 'name', '212121');
const userArray = [user, new User('email2@example.com', 'name2', '1234')];

describe('User', () => {
  let service: UserService;
  let repo: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: () => {
              return userArray;
            },
            findOne: () => {
              return user;
            },
            insert: () => {
              return {};
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
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
        where: { identifier: 'external-identifier' },
      });
    });
  });

  describe('insert', () => {
    it('should insert a user', async () => {
      const repoSpy = jest.spyOn(repo, 'insert');
      await service.add(user);

      expect(repoSpy).toHaveBeenCalledWith(user);
    });
  });
});
