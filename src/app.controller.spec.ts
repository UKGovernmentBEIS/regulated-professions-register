import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { RequestContext } from 'express-openid-connect';

import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
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
    it('should return OK', () => {
      expect(appController.healthCheck()).toEqual({ status: 'OK' });
    });
  });
});
