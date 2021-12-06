import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './user.entity';
import { PersonalDetailsController } from './personal-details.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

const name = 'Example Name';
const email = 'name@example.com';

const populatedSession = {
  'user-creation-flow': { name, email },
};

describe('PersonalDetailsController', () => {
  let controller: PersonalDetailsController;
  let userService: DeepMocked<UserService>;
  let populatedSession;

  beforeEach(async () => {
    userService = createMock<UserService>();

    populatedSession = {
      'user-creation-flow': { name, email, userCreated: false },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalDetailsController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
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

  describe('new', () => {
    it('should throw an exception when called in edit mode with an empty session', () => {
      expect(() => {
        controller.new(true, {});
      }).toThrowError();
    });

    it('should throw an exception when called with a session where the user has already been created', () => {
      expect(() => {
        controller.new(true, {
          'user-creation-flow': { name, email, userCreated: true },
        });
      }).toThrowError();
    });

    it('should return empty template params when called with an empty session', () => {
      const result = controller.new(false, {});

      expect(result).toEqual({ name: '', email: '', edit: false });
    });

    it('should return populated template params when called with a populated session', () => {
      const result = controller.new(false, populatedSession);

      expect(result).toEqual({
        name,
        email,
        edit: false,
      });
    });

    it('should remaining in edit mode when called in edit mode', () => {
      const result = controller.new(true, populatedSession);

      expect(result).toEqual({ name, email, edit: true });
    });
  });

  describe('create', () => {
    let res;

    beforeEach(() => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
      };
    });

    it('should throw an exception when called in edit mode with an empty session', () => {
      expect(() => {
        return controller.create({ name: name, email, edit: 'true' }, {}, res);
      }).rejects.toThrow();
    });

    it('should redirect to `confirm` and populate the session when the email address is not already in use and the body is populated', async () => {
      userService.findByEmail.mockImplementationOnce(() => {
        return null;
      });

      const session = {};

      await controller.create(
        { name: name, email, edit: 'false' },
        session,
        res,
      );

      expect(session).toEqual(populatedSession);
      expect(res.redirect).toHaveBeenCalledWith('confirm');
    });

    it('should render an error if the name is empty', async () => {
      await controller.create({ name: '', email, edit: 'false' }, {}, res);

      expect(res.render).toBeCalledTimes(1);
      expect(res.render.mock.calls[0][0]).toEqual('user/personal-details/new');
      expect(res.render.mock.calls[0][1]).toMatchObject({
        name: '',
        email,
        edit: false,
        errors: { name: {} },
      });
    });

    it('should render an error if the email is empty', async () => {
      await controller.create({ name, email: '', edit: 'false' }, {}, res);

      expect(res.render).toBeCalledTimes(1);
      expect(res.render.mock.calls[0][0]).toEqual('user/personal-details/new');
      expect(res.render.mock.calls[0][1]).toMatchObject({
        name,
        email: '',
        edit: false,
        errors: { email: {} },
      });
    });

    it('should render an error if the email address is already in use', async () => {
      userService.findByEmail.mockImplementationOnce(async () => {
        return new User('name@example.com', name);
      });

      await controller.create({ name, email, edit: 'false' }, {}, res);

      expect(userService.findByEmail).toHaveBeenCalledWith('name@example.com');

      expect(res.render).toBeCalledTimes(1);
      expect(res.render.mock.calls[0][0]).toEqual('user/personal-details/new');
      expect(res.render.mock.calls[0][1]).toMatchObject({
        name,
        email,
        edit: false,
        errors: { email: {} },
      });
    });
  });
});
