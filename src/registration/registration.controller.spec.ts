import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from '../users/user.service';
import { User } from '../users/user.entity';
import { Auth0UserCreationService } from './auth0-user-creation.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { RegistrationController } from './registration.controller';
import { Connection } from 'typeorm';

const user = new User('email@example.com', 'name', '212121');
const userArray = [user, new User('email2@example.com', 'name2', '1234')];

describe('RegistrationController', () => {
  let controller: RegistrationController;

  beforeEach(async () => {
    // Is there a better way to set this up?
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RegistrationController],
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

    controller = module.get<RegistrationController>(RegistrationController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
