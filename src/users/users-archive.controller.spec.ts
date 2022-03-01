import { Test, TestingModule } from '@nestjs/testing';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';

import { UsersService } from './users.service';
import { Auth0Service } from './auth0.service';
import { UsersArchiveController } from './users-archive.controller';

import userFactory from '../testutils/factories/user';
import { translationOf } from '../testutils/translation-of';
import { createMockI18nService } from '../testutils/create-mock-i18n-service';
import { flashMessage } from '../common/flash-message';

import { createDefaultMockRequest } from '../testutils/factories/create-default-mock-request';

jest.mock('../common/flash-message');

describe('UsersArchiveController', () => {
  let controller: UsersArchiveController;
  let auth0Service: DeepMocked<Auth0Service>;
  let usersService: DeepMocked<UsersService>;
  let request: DeepMocked<Request>;

  beforeEach(async () => {
    const i18nService = createMockI18nService();

    request = createDefaultMockRequest();

    auth0Service = createMock<Auth0Service>();
    usersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersArchiveController],
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
      ],
    }).compile();

    controller = module.get<UsersArchiveController>(UsersArchiveController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('new', () => {
    it('should return a user', async () => {
      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      expect(await controller.new('some-uuid')).toEqual({
        ...user,
      });

      expect(usersService.find).toHaveBeenCalledWith('some-uuid');
    });
  });

  describe('delete', () => {
    it('should add an archived flag to a user', async () => {
      const flashMock = flashMessage as jest.Mock;

      flashMock.mockImplementation(() => 'Stub Archive Message');

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
        translationOf('users.archive.confirmation.body'),
      );

      expect(request.flash).toHaveBeenCalledWith(
        'success',
        'Stub Archive Message',
      );

      expect(auth0Service.deleteUser).toHaveBeenCalledWith(
        user.externalIdentifier,
      );

      expect(usersService.save).toHaveBeenCalledWith({
        ...user,
        archived: true,
      });
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
