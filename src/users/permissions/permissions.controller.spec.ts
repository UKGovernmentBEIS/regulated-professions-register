import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UserPermission } from '../user-permission';
import { PermissionsController } from './permissions.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import { createMockRequest } from '../../testutils/create-mock-request';
import userFactory from '../../testutils/factories/user';

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let usersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<PermissionsController>(PermissionsController);
  });

  describe('edit', () => {
    it('should get and return the user from an id', async () => {
      const referrer = 'http://example.com/some/path';
      const request = createMockRequest(referrer, 'example.com');

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      const result = await controller.edit(request, user.id, false);

      expect(result).toEqual({
        ...user,
        permissions: [
          'createUser',
          'editUser',
          'deleteUser',
          'createOrganisation',
          'deleteOrganisation',
          'createProfession',
          'deleteprofession',
          'uploadDecisionData',
          'downloadDecisionData',
          'viewDecisionData',
        ],
        change: false,
      });

      expect(usersService.find).toHaveBeenCalledWith(user.id);
    });

    it('should set change to true', async () => {
      const referrer = 'http://example.com/some/path';
      const request = createMockRequest(referrer, 'example.com');

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      const result = await controller.edit(request, user.id, true);

      expect(result).toEqual({
        ...user,
        permissions: [
          'createUser',
          'editUser',
          'deleteUser',
          'createOrganisation',
          'deleteOrganisation',
          'createProfession',
          'deleteprofession',
          'uploadDecisionData',
          'downloadDecisionData',
          'viewDecisionData',
        ],
        change: true,
      });
    });
  });

  describe('create', () => {
    it('should redirect to confirm and update if the DTO is valid', async () => {
      const res = createMock<Response>();

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);
      usersService.save.mockResolvedValue(user);

      const permissionsDto = {
        permissions: [UserPermission.CreateUser],
        serviceOwner: true,
        change: true,
      };
      await controller.create(permissionsDto, user.id, res);

      expect(usersService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id,
          ...permissionsDto,
        }),
      );
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/${user.id}/confirm`,
      );
    });
  });
});
