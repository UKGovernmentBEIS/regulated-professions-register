import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { UserController } from './user.controller';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

const name = 'Example Name';
const email = 'name@example.com';
const identifier = 'example-external-identifier';

describe('UserController', () => {
  let controller: UserController;
  let externalUserCreationService: DeepMocked<ExternalUserCreationService>;
  let userService: DeepMocked<UserService>;
  let populatedSession;

  beforeEach(async () => {
    externalUserCreationService = createMock<ExternalUserCreationService>({
      createExternalUser: async () => {
        return { result: 'user-created', externalIdentifier: identifier };
      },
    });

    userService = createMock<UserService>();

    populatedSession = {
      'user-creation-flow': { name, email, userCreated: false },
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: userService,
        },
        {
          provide: ExternalUserCreationService,
          useValue: externalUserCreationService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('newPost', () => {
    it('should reset the session', () => {
      controller.newPost(populatedSession);

      expect(populatedSession).toEqual({
        'user-creation-flow': { userCreated: false },
      });
    });
  });

  describe('confirm', () => {
    it('should throw an exception when called with an empty session', () => {
      expect(async () => {
        await controller.confirm({});
      }).rejects.toThrowError();
    });

    it('should return populated template params when called with a populated session', () => {
      const result = controller.confirm(populatedSession);

      expect(result).toEqual({
        name,
        email,
      });
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

    it('should throw an exception when called with an empty session', () => {
      expect(async () => {
        await controller.create({}, res);
      }).rejects.toThrowError();
    });

    it('should redirct to `done` when the user is successfully created', async () => {
      await controller.create(populatedSession, res);

      expect(externalUserCreationService.createExternalUser).toBeCalledWith(
        email,
      );
      expect(userService.add).toBeCalledWith({ name, email, identifier });
      expect(res.redirect).toBeCalledWith('done');
    });

    it('should mark the user as created in our session when the user is successfully created', async () => {
      await controller.create(populatedSession, res);

      expect(populatedSession).toEqual({
        'user-creation-flow': { name, email, userCreated: true },
      });
    });

    it('should render an error if the email already exists externally and in our database', async () => {
      externalUserCreationService.createExternalUser.mockImplementationOnce(
        async () => {
          return { result: 'user-exists', externalIdentifier: identifier };
        },
      );

      userService.attemptAdd.mockImplementationOnce(async () => {
        return 'user-exists';
      });

      await controller.create(populatedSession, res);

      expect(res.render).toBeCalledWith('user/confirm', {
        email,
        name,
        userAlreadyExists: true,
      });
    });

    it('should create a user in our db even if the user already exists externally', async () => {
      externalUserCreationService.createExternalUser.mockImplementationOnce(
        async () => {
          return { result: 'user-exists', externalIdentifier: identifier };
        },
      );

      userService.attemptAdd.mockImplementationOnce(async () => {
        return 'user-created';
      });

      await controller.create(populatedSession, res);

      expect(userService.attemptAdd).toBeCalledWith({
        name,
        email,
        identifier,
      });
      expect(res.redirect).toBeCalledWith('done');
    });

    describe('done', () => {
      it('should return populated template params when called with a session where the user has been created', () => {
        const result = controller.done({
          'user-creation-flow': { name, email, userCreated: true },
        });

        expect(result).toEqual({ email });
      });

      it('should throw an exception when called with a session where the user has not been created', () => {
        expect(() => {
          controller.done(populatedSession);
        }).toThrowError();
      });
    });
  });
});
