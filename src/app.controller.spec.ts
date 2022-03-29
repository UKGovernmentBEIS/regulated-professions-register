import { Test, TestingModule } from '@nestjs/testing';

import { AppController } from './app.controller';
import { createMockRequest } from './testutils/create-mock-request';
import organisationFactory from './testutils/factories/organisation';
import userFactory from './testutils/factories/user';
import { getActingUser } from './users/helpers/get-acting-user.helper';

jest.mock('./users/helpers/get-acting-user.helper');

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('admin', () => {
    describe('when the user is a service owner', () => {
      it('returns the BEIS user', () => {
        const user = userFactory.build({ serviceOwner: true });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user },
        );

        (getActingUser as jest.Mock).mockReturnValue(user);

        expect(appController.admin(request)).toEqual({
          organisation: 'app.beis',
        });
      });
    });

    describe('when the user is not a service owner', () => {
      it("fetches the user's organisation", () => {
        const organisation = organisationFactory.build({
          name: 'Department for Education',
        });
        const user = userFactory.build({ serviceOwner: false, organisation });

        const request = createMockRequest(
          'http://example.com/some/path',
          'example.com',
          { user },
        );

        (getActingUser as jest.Mock).mockReturnValue(user);

        expect(appController.admin(request)).toEqual({
          organisation: 'Department for Education',
        });
      });
    });
  });

  describe('healthCheck', () => {
    const OLD_ENV = process.env;

    beforeEach(async () => {
      jest.resetModules();
      process.env = { ...OLD_ENV };
    });

    afterAll(() => {
      process.env = OLD_ENV;
    });

    it('should return OK', () => {
      expect(appController.healthCheck()).toEqual({ status: 'OK' });
    });

    describe('when the deployment variables are set', () => {
      beforeEach(async () => {
        process.env['CURRENT_SHA'] = 'b9c73f88';
        process.env['TIME_OF_BUILD'] = '2020-01-01T00:00:00Z';
      });

      it('should return the sha and the time it was built', () => {
        expect(appController.healthCheck()).toEqual({
          status: 'OK',
          git_sha: 'b9c73f88',
          built_at: '2020-01-01T00:00:00Z',
        });
      });
    });
  });

  describe('cookies', () => {
    it('returns without error', () => {
      expect(appController.cookies()).toEqual(undefined);
    });
  });

  describe('privacyPolicy', () => {
    it('returns without error', () => {
      expect(appController.privacyPolicy()).toEqual(undefined);
    });
  });

  describe('accessibility', () => {
    it('returns without error', () => {
      expect(appController.accessibility()).toEqual(undefined);
    });
  });

  describe('dataDisclaimer', () => {
    it('returns without error', () => {
      expect(appController.dataDisclaimer()).toEqual(undefined);
    });
  });
});
