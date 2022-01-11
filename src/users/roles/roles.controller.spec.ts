import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { User, UserRole } from '../user.entity';
import { RolesController } from './roles.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Request, Response } from 'express';
import { createMockRequest } from '../../testutils/create-mock-request';
import userFactory from '../../testutils/factories/user';

describe('RolesController', () => {
  let controller: RolesController;
  let usersService: DeepMocked<UsersService>;
  let user: User;

  beforeEach(async () => {
    user = userFactory.build({
      id: 'user-uuid',
    });

    usersService = createMock<UsersService>({
      find: async () => {
        return user;
      },
      save: async () => {
        return user;
      },
    });

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
  });

  describe('edit', () => {
    const referrer = 'http://example.com/some/path';
    const request: Request = createMockRequest(referrer, 'example.com');

    it('should get and return the user from an id', async () => {
      const result = await controller.edit(request, 'user-uuid', false);

      expect(result).toEqual({
        ...user,
        roles: ['admin', 'editor'],
        backLink: referrer,
        change: false,
      });
    });

    it('should set change to true', async () => {
      const result = await controller.edit(request, 'user-uuid', true);

      expect(result).toEqual({
        ...user,
        roles: ['admin', 'editor'],
        backLink: referrer,
        change: true,
      });
    });
  });

  describe('create', () => {
    let res: DeepMocked<Response>;

    beforeEach(() => {
      res = createMock<Response>();
    });

    it('should redirect to confirm and update if the DTO is valid', async () => {
      const rolesDto = {
        roles: [UserRole.Admin],
        serviceOwner: true,
        change: true,
      };
      await controller.create(rolesDto, 'user-uuid', res);

      expect(usersService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'user-uuid',
          ...rolesDto,
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/user-uuid/confirm`,
      );
    });
  });
});
