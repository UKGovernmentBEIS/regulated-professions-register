import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Connection } from 'typeorm';
import { PersonalDetailsController } from './personal-details.controller';

const user = new User('email@example.com', 'name', '212121');
const userArray = [user, new User('email2@example.com', 'name2', '1234')];

const populatedSession = {
  'user-creation-flow': {
    name: 'Example Name',
    email: 'name@example.com',
  },
};

describe.only('PersonalDetailsController', () => {
  let controller: PersonalDetailsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PersonalDetailsController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            find: () => {
              return userArray;
            },
            findOne: () => {
              return user;
            },
            insert: () => {
              return {};
            },
          },
        },
        {
          provide: Connection,
          useValue: {},
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

    it('should not throw an exception when called in edit mode with a populated session', () => {
      expect(() => {
        controller.new(true, populatedSession);
      }).not.toThrow();
    });

    it('should return empty template params when called with an empty session', () => {
      const result = controller.new(false, {});

      expect(result).toEqual({ name: '', email: '', edit: false });
    });

    it('should return populated template params when called with a populated session', () => {
      const result = controller.new(false, populatedSession);

      expect(result).toEqual({
        name: 'Example Name',
        email: 'name@example.com',
        edit: false,
      });
    });
  });

  describe('create', () => {
    it('should throw an exception when called in edit mode with an empty session', () => {
      expect(() => {
        controller.new(true, {});
      }).toThrowError();
    });  })
});
