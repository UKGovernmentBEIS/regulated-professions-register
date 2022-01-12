import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';

import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { PersonalDetailsController } from './personal-details.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { createMockRequest } from '../../testutils/create-mock-request';

const name = 'Example Name';
const email = 'name@example.com';

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
    const referrer = 'http://example.com/some/path';
    const request: Request = createMockRequest(referrer, 'example.com');

    it('should get and return the user from an id', async () => {
      const result = await controller.edit(request, 'user-uuid', false);

      expect(result).toEqual({
        ...user,
        backLink: referrer,
        change: false,
      });
    });

    it('should set change to true', async () => {
      const result = await controller.edit(request, 'user-uuid', true);

      expect(result).toEqual({
        ...user,
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

    it('should redirect to permissions and update the user the email address is not already in use and the body is populated', async () => {
      usersService.findByEmail.mockImplementationOnce(() => {
        return null;
      });

      await controller.create({ name: name, email: email }, res, 'user-uuid');

      expect(usersService.save).toHaveBeenCalledWith({
        id: 'user-uuid',
        name: name,
        email: email,
      });
      expect(res.redirect).toHaveBeenCalledWith(
        `/admin/users/user-uuid/permissions/edit`,
      );
    });

    it('should render an error if the name is empty', async () => {
      await controller.create({ name: '', email }, res, 'user-uuid');

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
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
      await controller.create({ name, email: '' }, res, 'user-uuid');

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
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

    it('should render an error if the email address is already in use', async () => {
      usersService.findByEmail.mockImplementationOnce(async () => {
        return new User('name@example.com', name);
      });

      await controller.create({ name, email }, res, 'user-uuid');

      expect(usersService.findByEmail).toHaveBeenCalledWith('name@example.com');

      expect(res.render).toHaveBeenCalledWith(
        'admin/users/personal-details/edit',
        {
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
  });
});
