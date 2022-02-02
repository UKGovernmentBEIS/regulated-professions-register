import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { Auth0Service } from './auth0.service';
import { UsersController } from './users.controller';
import { User, UserPermission } from './user.entity';
import { UsersPresenter } from './users.presenter';
import { UserPresenter } from './user.presenter';
import { UserMailer } from './user.mailer';
import { PerformNowOrLater } from '../common/interfaces/perform-now-or-later';
import { flashMessage } from '../common/flash-message';

import userFactory from '../testutils/factories/user';

const name = 'Example Name';
const email = 'name@example.com';
const externalIdentifier = 'example-external-identifier';
const permissions = new Array<UserPermission>();

jest.mock('../common/flash-message');

describe('UsersController', () => {
  let controller: UsersController;
  let auth0Service: DeepMocked<Auth0Service>;
  let usersService: DeepMocked<UsersService>;
  let i18nService: DeepMocked<I18nService>;
  let userMailer: DeepMocked<UserMailer>;
  let request: DeepMocked<Request>;
  let user: User;
  let deleteUserResponse: jest.Mock<PerformNowOrLater>;

  beforeEach(async () => {
    user = userFactory.build({
      id: 'user-uuid',
      name: name,
      email: email,
      externalIdentifier: externalIdentifier,
      permissions: permissions,
    });

    request = createMock<Request>();

    deleteUserResponse = jest.fn(() => {
      return {
        performNow: async () => {
          return null;
        },
        performLater: async () => {
          return null;
        },
      };
    });

    auth0Service = createMock<Auth0Service>({
      createUser: async () => {
        return {
          result: 'user-created',
          externalIdentifier,
          passwordResetLink: 'http://example.org',
        };
      },
      deleteUser: deleteUserResponse,
    });

    i18nService = createMock<I18nService>();
    userMailer = createMock<UserMailer>();

    usersService = createMock<UsersService>({
      save: async () => {
        return user;
      },
      find: async () => {
        return user;
      },
      where: async () => {
        return [user];
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
        {
          provide: Auth0Service,
          useValue: auth0Service,
        },
        {
          provide: I18nService,
          useValue: i18nService,
        },
        {
          provide: UserMailer,
          useValue: userMailer,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('index', () => {
    it('should list all confirmed users', async () => {
      const users = [user];
      const usersPresenter = new UsersPresenter(users, i18nService);

      expect(await controller.index()).toEqual({
        ...users,
        rows: usersPresenter.tableRows(),
      });

      expect(usersService.where).toHaveBeenCalledWith({ confirmed: true });
    });
  });

  describe('show', () => {
    it('should return a user', async () => {
      const usersPresenter = new UserPresenter(user, i18nService);

      expect(await controller.show('some-uuid')).toEqual({
        ...user,
        permissionList: await usersPresenter.permissionList(),
      });

      expect(usersService.find).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('create', () => {
    it('should create a user and redirect', async () => {
      const res = createMock<Response>();

      await controller.create(res);

      expect(usersService.save).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/${user.id}/personal-details/edit`,
      );
    });
  });

  describe('confirm', () => {
    it('should return the user given an ID', async () => {
      const usersPresenter = new UserPresenter(user, i18nService);
      const result = await controller.confirm(user.id);

      expect(usersService.find).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({
        ...user,
        permissionList: await usersPresenter.permissionList(),
      });
    });
  });

  describe('complete', () => {
    let res: DeepMocked<Response>;

    beforeEach(() => {
      res = createMock<Response>();
    });

    it('should redirect to done when the user is successfully created', async () => {
      await controller.complete(res, user.id);

      expect(auth0Service.createUser).toBeCalledWith(email);
      expect(usersService.save).toBeCalledWith(
        expect.objectContaining({
          name,
          email,
          externalIdentifier,
          permissions,
          confirmed: true,
        }),
      );
      expect(userMailer.confirmation).toBeCalledWith(
        user,
        'http://example.org',
      );
      expect(res.redirect).toBeCalledWith('done');
    });

    it('should render an error if the email already exists externally and in our database', async () => {
      auth0Service.createUser.mockImplementationOnce(async () => {
        return { result: 'user-exists', externalIdentifier };
      });

      usersService.attemptAdd.mockImplementationOnce(async () => {
        return 'user-exists';
      });

      await controller.complete(res, user.id);

      expect(res.render).toBeCalledWith('users/confirm', {
        ...user,
        userAlreadyExists: true,
      });
    });

    it('should create a user in our db even if the user already exists externally', async () => {
      auth0Service.createUser.mockImplementationOnce(async () => {
        return { result: 'user-exists', externalIdentifier };
      });

      usersService.attemptAdd.mockImplementationOnce(async () => {
        return 'user-created';
      });

      await controller.complete(res, user.id);

      expect(usersService.attemptAdd).toBeCalledWith(
        expect.objectContaining({
          name,
          email,
          externalIdentifier,
          permissions,
          confirmed: true,
        }),
      );
      expect(res.redirect).toBeCalledWith('done');
    });

    describe('done', () => {
      it('should return populated template params when called with a session where the user has been created', async () => {
        const result = await controller.done(user.id);

        expect(result).toEqual(user);
      });
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const message = await i18nService.translate(
        'users.form.delete.successMessage',
      );
      const flashMock = flashMessage as jest.Mock;

      flashMock.mockImplementation(() => 'Stub Deletion Message');

      await controller.delete(request, 'some-uuid');

      expect(flashMock).toHaveBeenCalledWith(message);

      expect(request.flash).toHaveBeenCalledWith(
        'success',
        'Stub Deletion Message',
      );

      expect(auth0Service.deleteUser).toHaveBeenCalledWith(
        user.externalIdentifier,
      );
      expect(deleteUserResponse).toHaveBeenCalled();

      expect(usersService.delete).toHaveBeenCalledWith('some-uuid');
    });
  });
});
