import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { RequestContext } from 'express-openid-connect';

import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('admin', () => {
    it('should return the name of the logged in user', () => {
      const oidc: Partial<RequestContext> = {
        user: {
          nickname: 'Nickname',
        },
      };
      const request = { oidc: oidc } as Request;

      expect(appController.admin(request)).toEqual({
        name: 'Nickname',
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
});
