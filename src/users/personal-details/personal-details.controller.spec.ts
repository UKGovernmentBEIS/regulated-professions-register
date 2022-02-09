import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { PersonalDetailsController } from './personal-details.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getActionTypeFromUser } from '../helpers/get-action-type-from-user';

const name = 'Example Name';
const email = 'name@example.com';

jest.mock('../helpers/get-action-type-from-user');

describe('PersonalDetailsController', () => {
  let controller: PersonalDetailsController;
  let usersService: DeepMocked<UsersService>;
  let user: User;

  beforeEach(async () => {
    user = createMock<User>({
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
      controllers: [PersonalDetailsController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<PersonalDetailsController>(
      PersonalDetailsController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('edit', () => {
    it('should get and return the user from an id', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      const result = await controller.edit('user-uuid', false);

      expect(result).toEqual({
        ...user,
        action: 'edit',
        change: false,
      });
    });

    it('should set change to true', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      const result = await controller.edit('user-uuid', true);

      expect(result).toEqual({
        ...user,
        action: 'edit',
        change: true,
      });
    });
  });

  describe('update', () => {
    let res: DeepMocked<Response>;

    beforeEach(() => {
      res = createMock<Response>();
    });

    it('should redirect to role and update the user the email address is not already in use and the body is populated', async () => {
      usersService.findByEmail.mockImplementationOnce(() => {
        return null;
      });

      await controller.update({ name: name, email: email }, res, 'user-uuid');

      expect(usersService.save).toHaveBeenCalledWith({
        id: 'user-uuid',
        name: name,
        email: email,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/user-uuid/role/edit`,
      );
    });

    it('should render an error if the name is empty', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      await controller.update({ name: '', email }, res, 'user-uuid');

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
          action: 'edit',
          name: '',
          email,
          errors: {
            name: {
              text: 'name should not be empty',
            },
          },
        },
      );
    });

    it('should render an error if the email is empty', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      await controller.update({ name, email: '' }, res, 'user-uuid');

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
          action: 'edit',
          name,
          email: '',
          errors: {
            email: {
              text: 'email must be an email,email should not be empty',
            },
          },
        },
      );
    });

    it('should render an error if the email address is already in use by another user', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      usersService.findByEmail.mockImplementationOnce(async () => {
        return new User('name@example.com', name);
      });

      await controller.update({ name, email }, res, 'user-uuid');

      expect(usersService.findByEmail).toHaveBeenCalledWith('name@example.com');

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
          action: 'edit',
          name,
          email,
          errors: {
            email: {
              text: 'A user with this email address already exists',
            },
          },
        },
      );
    });

    it('should not render an error if the email address is in use by the user we are currently updating', async () => {
      usersService.findByEmail.mockImplementationOnce(async () => {
        const user = new User('name@example.com', name);
        user.id = 'user-uuid';

        return user;
      });

      await controller.update({ name, email }, res, 'user-uuid');

      await controller.update({ name: name, email: email }, res, 'user-uuid');

      expect(usersService.save).toHaveBeenCalledWith({
        id: 'user-uuid',
        name: name,
        email: email,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/user-uuid/role/edit`,
      );
    });
  });
});
