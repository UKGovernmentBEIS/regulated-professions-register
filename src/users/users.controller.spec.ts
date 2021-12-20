import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { UsersController } from './users.controller';
import { User, UserRole } from './user.entity';
import { UsersPresenter } from './users.presenter';
import { UserPresenter } from './user.presenter';

const name = 'Example Name';
const email = 'name@example.com';
const externalIdentifier = 'example-external-identifier';
const roles = new Array<UserRole>();

describe('UsersController', () => {
  let controller: UsersController;
  let externalUserCreationService: DeepMocked<ExternalUserCreationService>;
  let usersService: DeepMocked<UsersService>;
  let i18nService: DeepMocked<I18nService>;
  let user: User;

  beforeEach(async () => {
    user = createMock<User>({
      id: 'user-uuid',
      name: name,
      email: email,
      externalIdentifier: externalIdentifier,
      roles: roles,
    });

    externalUserCreationService = createMock<ExternalUserCreationService>({
      createExternalUser: async () => {
        return { result: 'user-created', externalIdentifier };
      },
    });

    i18nService = createMock<I18nService>();

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
          provide: ExternalUserCreationService,
          useValue: externalUserCreationService,
        },
        {
          provide: I18nService,
          useValue: i18nService,
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
        roleList: await usersPresenter.roleList(),
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
        roleList: await usersPresenter.roleList(),
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

      expect(externalUserCreationService.createExternalUser).toBeCalledWith(
        email,
      );
      expect(usersService.save).toBeCalledWith({
        name,
        email,
        externalIdentifier,
        roles,
        confirmed: true,
      });
      expect(res.redirect).toBeCalledWith('done');
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

      await controller.complete(res, user.id);

      expect(res.render).toBeCalledWith('users/confirm', {
        ...user,
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

      await controller.complete(res, user.id);

      expect(usersService.attemptAdd).toBeCalledWith({
        name,
        email,
        externalIdentifier,
        roles,
        confirmed: true,
      });
      expect(res.redirect).toBeCalledWith('done');
    });

    describe('done', () => {
      it('should return populated template params when called with a session where the user has been created', async () => {
        const result = await controller.done(user.id);

        expect(result).toEqual(user);
      });
    });
  });
});
