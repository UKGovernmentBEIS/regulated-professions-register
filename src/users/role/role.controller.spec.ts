import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { RoleController as RoleController } from './role.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Response } from 'express';
import userFactory from '../../testutils/factories/user';
import { RadioButtonArgs } from '../../common/interfaces/radio-button-args.interface';
import { RoleRadioButtonsPresenter } from '../presenters/role-radio-buttons.preseter';
import { I18nService } from 'nestjs-i18n';
import { createMockI18nService } from '../../testutils/create-mock-i18n-service';
import { Role } from '../role';
import { getActionTypeFromUser } from '../helpers/get-action-type-from-user';

jest.mock('../presenters/role-radio-buttons.preseter');
jest.mock('../helpers/get-action-type-from-user');

describe('RoleController', () => {
  let controller: RoleController;
  let usersService: DeepMocked<UsersService>;
  let i18nService: DeepMocked<I18nService>;

  beforeEach(async () => {
    usersService = createMock<UsersService>();
    i18nService = createMockI18nService();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RoleController],
      providers: [
        {
          provide: I18nService,
          useValue: i18nService,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<RoleController>(RoleController);
  });

  describe('edit', () => {
    it('should get and return the user from an id', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

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
        'admin/users/role/edit',
        expect.objectContaining({
          action: 'edit',
          roleRadioButtonArgs,
          change: false,
        }),
      );

      expect(usersService.find).toHaveBeenCalledWith(user.id);

      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        expect.anything(),
        false,
        Role.Registrar,
        i18nService,
      );
      expect(RoleRadioButtonsPresenter.prototype.radioButtonArgs).toBeCalled();
    });

    it('should set change to true', async () => {
      const res = createMock<Response>();

      const user = userFactory.build();

      usersService.find.mockResolvedValue(user);

      await controller.edit(res, user.id, true);

      expect(res.render).toBeCalledWith(
        'admin/users/role/edit',
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

      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        [Role.Administrator, Role.Editor],
        false,
        expect.anything(),
        i18nService,
      );
    });

    it('should return the correct roles for a service owner user', async () => {
      const res = createMock<Response>();

      const user = userFactory.build({ serviceOwner: true });

      usersService.find.mockResolvedValue(user);

      await controller.edit(res, user.id, false);

      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        [Role.Administrator, Role.Registrar, Role.Editor],
        true,
        expect.anything(),
        i18nService,
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
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

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
        'admin/users/role/edit',
        expect.objectContaining({
          action: 'edit',
          roleRadioButtonArgs,
        }),
      );

      expect(RoleRadioButtonsPresenter).toBeCalledWith(
        [Role.Administrator, Role.Editor],
        false,
        undefined,
        i18nService,
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
