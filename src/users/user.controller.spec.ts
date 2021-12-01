import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Auth0UserCreationService } from './auth0-user-creation.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { UserController } from './user.controller';
import { Connection } from 'typeorm';

const user = new User('email@example.com', 'name', '212121');
const userArray = [user, new User('email2@example.com', 'name2', '1234')];

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: ExternalUserCreationService,
          useValue: new Auth0UserCreationService(),
        },
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
        {
          provide: Connection,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
