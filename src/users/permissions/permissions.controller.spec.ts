import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { PermissionsController } from './permissions.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import userFactory from '../../testutils/factories/user';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { RoleRadioButtonsPresenter } from '../presenters/role-radio-buttons.preseter';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { Role } from '../role';

jest.mock('../presenters/role-radio-buttons.preseter');

describe('PermissionsController', () => {
  let controller: PermissionsController;
  let usersService: DeepMocked<UsersService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PermissionsController],
      providers: [
        {
          provide: I18nService,
          useValue: createMockI18nService(),
        },
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
      const roleRadioButtonArgs: RadioButtonArgs[] = [
        {
          text: 'Administrator',
          value: 'administrator',
          checked: false,
        },
      ];

      (
        RoleRadioButtonsPresenter.prototype as DeepMocked<RoleRadioButtonsPresenter>
      ).radioButtonArgs.mockResolvedValue(roleRadioButtonArgs);

      const res = createMock<Response>();

      const user = userFactory.build({ role: Role.Registrar });

      usersService.find.mockResolvedValue(user);

      await controller.edit(res, user.id, false);

      expect(res.render).toBeCalledWith(
        'admin/users/permissions/edit',
        expect.objectContaining({
          roleRadioButtonArgs,
          change: false,
        }),
      );

      expect(usersService.find).toHaveBeenCalledWith(user.id);

      // The `{}` is a workaround for matching against the mocked
      // `I18nService`, which jest seems to have issues with
      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        expect.anything(),
        Role.Registrar,
        {},
      );
      expect(RoleRadioButtonsPresenter.prototype.radioButtonArgs).toBeCalled();
    });

    it('should set change to true', async () => {
      const res = createMock<Response>();

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      await controller.edit(res, user.id, true);

      expect(res.render).toBeCalledWith(
        'admin/users/permissions/edit',
        expect.objectContaining({
          change: true,
        }),
      );
    });

    it('should return the correct roles for a non-service owner user', async () => {
      const res = createMock<Response>();

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      await controller.edit(res, user.id, false);

      // The `{}` is a workaround for matching against the mocked
      // `I18nService`, which jest seems to have issues with
      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        [Role.Administrator, Role.Editor],
        expect.anything(),
        {},
      );
    });

    it('should return the correct roles for a service owner user', async () => {
      const res = createMock<Response>();

      const user = userFactory.build({ serviceOwner: true });

      usersService.find.mockResolvedValue(user);

      await controller.edit(res, user.id, false);

      // The `{}` is a workaround for matching against the mocked
      // `I18nService`, which jest seems to have issues with
      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        [Role.Administrator, Role.Registrar, Role.Editor],
        expect.anything(),
        {},
      );
    });
  });

  describe('update', () => {
    it('should redirect to confirm and update if the DTO is valid', async () => {
      const res = createMock<Response>();

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);
      usersService.save.mockResolvedValue(user);

      const permissionsDto = {
        role: Role.Editor,
      };

      await controller.update(res, user.id, permissionsDto);

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

    it('should render the edit page if the DTO is invalid', async () => {
      const roleRadioButtonArgs: RadioButtonArgs[] = [
        {
          text: 'Administrator',
          value: 'administrator',
          checked: false,
        },
      ];

      (
        RoleRadioButtonsPresenter.prototype as DeepMocked<RoleRadioButtonsPresenter>
      ).radioButtonArgs.mockResolvedValue(roleRadioButtonArgs);

      const res = createMock<Response>();

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      const permissionsDto = {
        role: undefined,
      };

      await controller.update(res, user.id, permissionsDto);

      expect(usersService.save).not.toHaveBeenCalled();

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/permissions/edit',
        expect.objectContaining({
          roleRadioButtonArgs,
        }),
      );

      // The `{}` is a workaround for matching against the mocked
      // `I18nService`, which jest seems to have issues with
      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        [Role.Administrator, Role.Editor],
        undefined,
        {},
      );
      expect(RoleRadioButtonsPresenter.prototype.radioButtonArgs).toBeCalled();
    });

    it('should not modify the service owner state of the user', async () => {
      const res = createMock<Response>();

      const user = userFactory.build({ serviceOwner: false });

      usersService.find.mockResolvedValue(user);

      const permissionsDto = {
        role: Role.Editor,
        serviceOwner: true,
      };

      await controller.update(res, user.id, permissionsDto);

      expect(usersService.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: user.id,
          serviceOwner: false,
        }),
      );

      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/${user.id}/confirm`,
      );
    });

    it('should not allow an invalid role for the service owner state', async () => {
      const res = createMock<Response>();

      const user = userFactory.build({ serviceOwner: false });

      usersService.find.mockResolvedValue(user);

      const permissionsDto = {
        role: Role.Registrar,
      };

      await expect(
        controller.update(res, user.id, permissionsDto),
      ).rejects.toThrowError();
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
