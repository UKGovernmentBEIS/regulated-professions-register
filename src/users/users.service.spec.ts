import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection, Repository } from 'typeorm';

import { User } from './user.entity';
import { UsersService } from './users.service';

const user = new User('email@example.com', 'name', '212121');
const userArray = [user, new User('email2@example.com', 'name2', '1234')];

describe('UsersService', () => {
  let service: UsersService;
  let repo: Repository<User>;

  beforeEach(async () => {
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
});
