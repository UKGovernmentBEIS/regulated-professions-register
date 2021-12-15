import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';

import { UsersService } from './users.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { UsersController } from './users.controller';
import { User, UserRole } from './user.entity';

const name = 'Example Name';
const email = 'name@example.com';
const externalIdentifier = 'example-external-identifier';
const roles = new Array<UserRole>();

describe('UsersController', () => {
  let controller: UsersController;
  let externalUserCreationService: DeepMocked<ExternalUserCreationService>;
  let usersService: DeepMocked<UsersService>;
  let user: User;
  let populatedSession;

  beforeEach(async () => {
    user = createMock<User>({
      id: 'user-uuid',
    });

    externalUserCreationService = createMock<ExternalUserCreationService>({
      createExternalUser: async () => {
        return { result: 'user-created', externalIdentifier };
      },
    });

    usersService = createMock<UsersService>({
      create: async () => {
        return user;
      },
    });

    populatedSession = {
      'user-creation-flow': { name, email, userCreated: false },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: ExternalUserCreationService,
          useValue: externalUserCreationService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user and redirect', async () => {
      const res = createMock<Response>();

      await controller.create(res);

      expect(usersService.create).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/${user.id}/personal-details/edit`,
      );
    });
  });

  describe('confirm', () => {
    it('should throw an exception when called with an empty session', () => {
      expect(async () => {
        await controller.confirm({});
      }).rejects.toThrowError();
    });

    it('should return populated template params when called with a populated session', () => {
      const result = controller.confirm(populatedSession);

      expect(result).toEqual({
        name,
        email,
      });
    });
  });

  describe('create', () => {
    let res: DeepMocked<Response>;

    beforeEach(() => {
      res = createMock<Response>();
    });

    it('should throw an exception when called with an empty session', () => {
      expect(async () => {
        await controller.complete({}, res);
      }).rejects.toThrowError();
    });

    it('should redirect to `done` when the user is successfully created', async () => {
      await controller.complete(populatedSession, res);

      expect(externalUserCreationService.createExternalUser).toBeCalledWith(
        email,
      );
      expect(usersService.add).toBeCalledWith({
        name,
        email,
        externalIdentifier,
        roles,
      });
      expect(res.redirect).toBeCalledWith('done');
    });

    it('should mark the user as created in our session when the user is successfully created', async () => {
      await controller.complete(populatedSession, res);

      expect(populatedSession).toEqual({
        'user-creation-flow': { name, email, userCreated: true },
      });
    });

    it('should render an error if the email already exists externally and in our database', async () => {
      externalUserCreationService.createExternalUser.mockImplementationOnce(
        async () => {
          return { result: 'user-exists', externalIdentifier };
        },
      );

      usersService.attemptAdd.mockImplementationOnce(async () => {
        return 'user-exists';
      });

      await controller.complete(populatedSession, res);

      expect(res.render).toBeCalledWith('users/confirm', {
        email,
        name,
        userAlreadyExists: true,
      });
    });

    it('should create a user in our db even if the user already exists externally', async () => {
      externalUserCreationService.createExternalUser.mockImplementationOnce(
        async () => {
          return { result: 'user-exists', externalIdentifier };
        },
      );

      usersService.attemptAdd.mockImplementationOnce(async () => {
        return 'user-created';
      });

      await controller.complete(populatedSession, res);

      expect(usersService.attemptAdd).toBeCalledWith({
        name,
        email,
        externalIdentifier,
        roles,
      });
      expect(res.redirect).toBeCalledWith('done');
    });

    describe('done', () => {
      it('should return populated template params when called with a session where the user has been created', () => {
        const result = controller.done({
          'user-creation-flow': { name, email, userCreated: true },
        });

        expect(result).toEqual({ email });
      });

      it('should throw an exception when called with a session where the user has not been created', () => {
        expect(() => {
          controller.done(populatedSession);
        }).toThrowError();
      });
    });
  });
});
