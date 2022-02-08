import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response, Request } from 'express';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { Auth0Service } from './auth0.service';
import { UsersController } from './users.controller';
import { UsersPresenter } from './presenters/users.presenter';
import { UserMailer } from './user.mailer';

import userFactory from '../testutils/factories/user';
import { translationOf } from '../testutils/translation-of';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { TableRow } from '../common/interfaces/table-row';
import { flashMessage } from '../common/flash-message';
import { createMockRequest } from '../testutils/create-mock-request';
import organisationFactory from '../testutils/factories/organisation';

jest.mock('./presenters/users.presenter');
jest.mock('./presenters/user.presenter');

jest.mock('../common/flash-message');

describe('UsersController', () => {
  let controller: UsersController;
  let auth0Service: DeepMocked<Auth0Service>;
  let usersService: DeepMocked<UsersService>;
  let userMailer: DeepMocked<UserMailer>;
  let request: DeepMocked<Request>;

  beforeEach(async () => {
    const i18nService = createMockI18nService();

    request = createMock<Request>();

    auth0Service = createMock<Auth0Service>();
    userMailer = createMock<UserMailer>();
    usersService = createMock<UsersService>();

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
    describe('when the acting user is a service owner', () => {
      it('should list all confirmed users', async () => {
        const actingUser = userFactory.build({
          serviceOwner: true,
        });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: actingUser },
        );

        const user = userFactory.build();

        const tableRows: TableRow[] = [
          [{ text: 'Example Name' }, { text: 'name@example.com' }],
        ];

        (
          UsersPresenter.prototype as DeepMocked<UsersPresenter>
        ).tableRows.mockReturnValue(tableRows);

        usersService.allConfirmed.mockResolvedValue([user]);

        expect(await controller.index(request)).toEqual({
          ...[user],
          rows: tableRows,
        });

        expect(usersService.allConfirmed).toHaveBeenCalledWith();
        expect(UsersPresenter.prototype.tableRows).toHaveBeenCalled();
      });
    });

    describe('when the acting user not is a service owner', () => {
      it("should list all confirmed users for the acting user's organisation", async () => {
        const actingUser = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: actingUser },
        );

        const user = userFactory.build();

        const tableRows: TableRow[] = [
          [{ text: 'Example Name' }, { text: 'name@example.com' }],
        ];

        (
          UsersPresenter.prototype as DeepMocked<UsersPresenter>
        ).tableRows.mockReturnValue(tableRows);

        usersService.allConfirmedForOrganisation.mockResolvedValue([user]);

        expect(await controller.index(request)).toEqual({
          ...[user],
          rows: tableRows,
        });

        expect(usersService.allConfirmedForOrganisation).toHaveBeenCalledWith(
          actingUser.organisation,
        );
        expect(UsersPresenter.prototype.tableRows).toHaveBeenCalled();
      });
    });
  });

  describe('show', () => {
    it('should return a user', async () => {
      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      expect(await controller.show('some-uuid')).toEqual({
        ...user,
      });

      expect(usersService.find).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('create', () => {
    describe('when logged in as a service owner user', () => {
      it('should create a user and redirect', async () => {
        const loggedInUser = userFactory.build({ serviceOwner: true });

        const user = userFactory.build();

        usersService.save.mockResolvedValue(user);

        const res = createMock<Response>();
        const req = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: loggedInUser },
        );

        await controller.create(req, res);

        expect(usersService.save).toHaveBeenCalledWith(
          expect.objectContaining({ organisation: undefined }),
        );
        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/users/${user.id}/organisation/edit`,
        );
      });
    });

    describe('when logged in as a non-service owner user', () => {
      it('should create a user and redirect', async () => {
        const loggedInUser = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });

        const user = userFactory.build();

        usersService.save.mockResolvedValue(user);

        const res = createMock<Response>();
        const req = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user: loggedInUser },
        );

        await controller.create(req, res);

        expect(usersService.save).toHaveBeenCalledWith(
          expect.objectContaining({ organisation: loggedInUser.organisation }),
        );
        expect(res.redirect).toHaveBeenCalledWith(
          `/admin/users/${user.id}/personal-details/edit`,
        );
      });
    });
  });

  describe('confirm', () => {
    it('should return the user given an ID', async () => {
      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      const result = await controller.confirm(user.id);

      expect(usersService.find).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({
        ...user,
      });
    });
  });

  describe('complete', () => {
    it('should redirect to done when the user is successfully created', async () => {
      const user = userFactory.build({ externalIdentifier: undefined });

      const res = createMock<Response>();

      usersService.find.mockResolvedValue(user);
      auth0Service.createUser.mockResolvedValue({
        result: 'user-created',
        externalIdentifier: 'extid|1234567',
        passwordResetLink: 'http://example.org',
      });

      await controller.complete(res, user.id);

      expect(auth0Service.createUser).toBeCalledWith(user.email);
      expect(usersService.save).toBeCalledWith(
        expect.objectContaining({
          name: user.name,
          email: user.email,
          externalIdentifier: 'extid|1234567',
          role: user.role,
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
      const user = userFactory.build({ externalIdentifier: undefined });

      const res = createMock<Response>();
      usersService.find.mockResolvedValue(user);

      auth0Service.createUser.mockImplementationOnce(async () => {
        return {
          result: 'user-exists',
          externalIdentifier: user.externalIdentifier,
        };
      });

      usersService.attemptAdd.mockImplementationOnce(async () => {
        return 'user-exists';
      });

      await controller.complete(res, user.id);

      expect(res.render).toBeCalledWith('admin/users/confirm', {
        ...user,
        userAlreadyExists: true,
      });
    });

    it('should create a user in our db even if the user already exists externally', async () => {
      const user = userFactory.build({ externalIdentifier: undefined });

      const res = createMock<Response>();
      usersService.find.mockResolvedValue(user);

      auth0Service.createUser.mockResolvedValue({
        result: 'user-exists',
        externalIdentifier: 'extid|1234567',
      });

      usersService.attemptAdd.mockResolvedValue('user-created');

      await controller.complete(res, user.id);

      expect(usersService.attemptAdd).toBeCalledWith(
        expect.objectContaining({
          name: user.name,
          email: user.email,
          externalIdentifier: 'extid|1234567',
          role: user.role,
          confirmed: true,
        }),
      );
      expect(res.redirect).toBeCalledWith('done');
    });

    it('should not attempt to create a user in auth0 if it already has an externalIdentifier', async () => {
      const user = userFactory.build({ externalIdentifier: 'extid|1234567' });
      const res = createMock<Response>();

      usersService.find.mockResolvedValue(user);

      await controller.complete(res, user.id);

      expect(auth0Service.createUser).not.toBeCalled();
      expect(userMailer.confirmation).not.toBeCalledWith(
        user,
        'http://example.org',
      );

      expect(usersService.save).toBeCalledWith(
        expect.objectContaining({
          name: user.name,
          email: user.email,
          externalIdentifier: user.externalIdentifier,
          role: user.role,
          confirmed: true,
        }),
      );

      expect(res.redirect).toBeCalledWith('done');
    });
  });

  describe('done', () => {
    it('should return populated template params when called with a session where the user has been created', async () => {
      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      const result = await controller.done(user.id);

      expect(result).toEqual(user);
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const flashMock = flashMessage as jest.Mock;

      flashMock.mockImplementation(() => 'Stub Deletion Message');

      const user = userFactory.build();

      auth0Service.deleteUser.mockReturnValue({
        performNow: async () => {
          return null;
        },
        performLater: async () => {
          return null;
        },
      });
      usersService.find.mockResolvedValue(user);

      await controller.delete(request, 'some-uuid');

      expect(flashMock).toHaveBeenCalledWith(
        translationOf('users.form.delete.successMessage'),
      );

      expect(request.flash).toHaveBeenCalledWith(
        'success',
        'Stub Deletion Message',
      );

      expect(auth0Service.deleteUser).toHaveBeenCalledWith(
        user.externalIdentifier,
      );

      expect(usersService.delete).toHaveBeenCalledWith('some-uuid');
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
