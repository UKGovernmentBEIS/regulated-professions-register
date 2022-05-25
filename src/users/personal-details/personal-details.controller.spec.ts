import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';

import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { PersonalDetailsController } from './personal-details.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { getActionTypeFromUser } from '../helpers/get-action-type-from-user';
import { createDefaultMockRequest } from '../../testutils/factories/create-default-mock-request';
import userFactory from '../../testutils/factories/user';
import { checkCanViewUser } from '../helpers/check-can-view-user';

const name = 'Example Name';
const email = 'name@example.com';

jest.mock('../helpers/get-action-type-from-user');
jest.mock('../helpers/get-acting-user.helper');
jest.mock('../helpers/check-can-view-user');

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

      const request = createDefaultMockRequest({ user: userFactory.build() });

      const result = await controller.edit('user-uuid', null, request);

      expect(result).toEqual({
        ...user,
        action: 'edit',
        source: null,
      });

      expect(checkCanViewUser).toHaveBeenCalledWith(request, user.organisation);
    });

    it('should set source to the given value', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      const request = createDefaultMockRequest({ user: userFactory.build() });

      const result = await controller.edit('user-uuid', 'show', request);

      expect(result).toEqual({
        ...user,
        action: 'edit',
        source: 'show',
      });
    });

    it('should check that the user has permissions to update the user', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');
      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.edit('user-uuid', null, request);

      expect(checkCanViewUser).toHaveBeenCalledWith(request, user.organisation);
    });
  });

  describe('update', () => {
    let res: DeepMocked<Response>;

    beforeEach(() => {
      res = createMock<Response>();
    });

    it('should redirect to role and update the user the email address if not already in use and the body is populated', async () => {
      usersService.findByEmail.mockImplementationOnce(() => {
        return null;
      });

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.update(
        { name: name, email: email },
        res,
        'user-uuid',
        request,
      );

      expect(usersService.save).toHaveBeenCalledWith({
        id: 'user-uuid',
        name: name,
        email: email,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/user-uuid/role/edit`,
      );
    });

    it('should correct a mis-formatted email address before saving', async () => {
      usersService.findByEmail.mockImplementationOnce(() => {
        return null;
      });

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.update(
        { name: name, email: ` ${email}  ` },
        res,
        'user-uuid',
        request,
      );

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

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.update({ name: '', email }, res, 'user-uuid', request);

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
          action: 'edit',
          name: '',
          email,
          errors: {
            name: {
              text: 'users.form.errors.name.empty',
            },
          },
        },
      );
    });

    it('should render an error if the email is empty', async () => {
      (getActionTypeFromUser as jest.Mock).mockReturnValue('edit');

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.update({ name, email: '' }, res, 'user-uuid', request);

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
          action: 'edit',
          name,
          email: '',
          errors: {
            email: {
              text: 'users.form.errors.email.invalid',
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

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.update({ name, email }, res, 'user-uuid', request);

      expect(usersService.findByEmail).toHaveBeenCalledWith('name@example.com');

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
          action: 'edit',
          name,
          email,
          errors: {
            email: {
              text: 'users.form.errors.email.alreadyExists',
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

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.update({ name, email }, res, 'user-uuid', request);

      await controller.update(
        { name: name, email: email },
        res,
        'user-uuid',
        request,
      );

      expect(usersService.save).toHaveBeenCalledWith({
        id: 'user-uuid',
        name: name,
        email: email,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/user-uuid/role/edit`,
      );
    });

    it('should check that the user has permissions to update the user', async () => {
      usersService.findByEmail.mockResolvedValue(null);

      const request = createDefaultMockRequest({ user: userFactory.build() });

      await controller.update(
        { name: name, email: email },
        res,
        'user-uuid',
        request,
      );

      expect(checkCanViewUser).toHaveBeenCalledWith(request, user.organisation);
    });
  });
});
