import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { Auth0Service } from './auth0.service';
import { UsersController } from './users.controller';
import { UsersPresenter } from './presenters/users.presenter';
import { UserMailer } from './user.mailer';

import userFactory from '../testutils/factories/user';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { TableRow } from '../common/interfaces/table-row';
import { getActionTypeFromUser } from './helpers/get-action-type-from-user';

import organisationFactory from '../testutils/factories/organisation';
import { getActingUser } from './helpers/get-acting-user.helper';
import { createDefaultMockRequest } from '../testutils/factories/create-default-mock-request';

jest.mock('./presenters/users.presenter');
jest.mock('./presenters/user.presenter');

jest.mock('../common/flash-message');
jest.mock('./helpers/get-action-type-from-user');

jest.mock('./helpers/get-acting-user.helper');

describe('UsersController', () => {
  let controller: UsersController;
  let auth0Service: DeepMocked<Auth0Service>;
  let usersService: DeepMocked<UsersService>;
  let userMailer: DeepMocked<UserMailer>;

  beforeEach(async () => {
    const i18nService = createMockI18nService();

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

        const request = createDefaultMockRequest();
        (getActingUser as jest.Mock).mockReturnValue(actingUser);

        const user = userFactory.build();

        const tableRows: TableRow[] = [
          [{ text: 'Example Name' }, { text: 'name@example.com' }],
        ];

        (
          UsersPresenter.prototype as DeepMocked<UsersPresenter>
        ).tableRows.mockReturnValue(tableRows);

        usersService.allConfirmed.mockResolvedValue([user]);

        expect(await controller.index(request)).toEqual({
          organisation: 'app.beis',
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

        const request = createDefaultMockRequest();
        (getActingUser as jest.Mock).mockReturnValue(actingUser);

        const user = userFactory.build();

        const tableRows: TableRow[] = [
          [{ text: 'Example Name' }, { text: 'name@example.com' }],
        ];

        (
          UsersPresenter.prototype as DeepMocked<UsersPresenter>
        ).tableRows.mockReturnValue(tableRows);

        usersService.allConfirmedForOrganisation.mockResolvedValue([user]);

        expect(await controller.index(request)).toEqual({
          organisation: actingUser.organisation.name,
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
        const actingUser = userFactory.build({ serviceOwner: true });

        const user = userFactory.build();

        usersService.save.mockResolvedValue(user);

        const res = createMock<Response>();
        const req = createDefaultMockRequest();
        (getActingUser as jest.Mock).mockReturnValue(actingUser);

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
        const actingUser = userFactory.build({
          serviceOwner: false,
          organisation: organisationFactory.build(),
        });

        const user = userFactory.build();

        usersService.save.mockResolvedValue(user);

        const res = createMock<Response>();
        const req = createDefaultMockRequest();
        (getActingUser as jest.Mock).mockReturnValue(actingUser);

        await controller.create(req, res);

        expect(usersService.save).toHaveBeenCalledWith(
          expect.objectContaining({ organisation: actingUser.organisation }),
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
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      const result = await controller.confirm(user.id);

      expect(usersService.find).toHaveBeenCalledWith(user.id);

      expect(result).toEqual({
        ...user,
        action: 'edit',
      });
    });
  });

  describe('complete', () => {
    describe('when creating a new user', () => {
      beforeEach(() => {
        (getActionTypeFromUser as jest.Mock).mockReturnValue('new');
      });

      it('should render the confirmation when the user is successfully created', async () => {
        const user = userFactory.build();

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

        expect(res.render).toBeCalledWith('admin/users/complete', {
          ...user,
          action: 'new',
        });
      });

      it('should render an error if the email already exists externally and in our database', async () => {
        const user = userFactory.build();

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
          action: 'new',
          userAlreadyExists: true,
        });
      });

      it('should create a user in our db even if the user already exists externally', async () => {
        const user = userFactory.build();

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

        expect(res.render).toBeCalledWith('admin/users/complete', {
          ...user,
          action: 'new',
        });
      });
    });

    describe('when editing an existing user', () => {
      beforeEach(() => {
        (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');
      });

      it('should not attempt to create a user in auth0', async () => {
        const user = userFactory.build();
        const res = createMock<Response>();

        usersService.find.mockResolvedValue(user);

        await controller.complete(res, user.id);

        expect(auth0Service.createUser).not.toBeCalled();
        expect(userMailer.confirmation).not.toBeCalled();

        expect(usersService.save).toBeCalledWith(
          expect.objectContaining({
            name: user.name,
            email: user.email,
            externalIdentifier: user.externalIdentifier,
            role: user.role,
            confirmed: true,
          }),
        );

        expect(res.render).toBeCalledWith('admin/users/complete', {
          ...user,
          action: 'edit',
        });
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
