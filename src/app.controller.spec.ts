import { Test, TestingModule } from '@nestjs/testing';
import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { NotFoundException } from '@nestjs/common';
import { Request, Response } from 'express';
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

  describe('select-service', () => {
    let response: DeepMocked<Response>;

    beforeEach(() => {
      response = createMock<Response>();
    });

    describe('when the query string is empty', () => {
      it('renders a template', () => {
        appController.selectService(response);

        expect(response.render).toHaveBeenCalledWith('select-service');
      });
    });

    describe('when the query string is populated', () => {
      it('redirects to the professions service', () => {
        appController.selectService(response, 'professions');

        expect(response.redirect).toHaveBeenCalledWith('/professions/search');
      });

      it('redirects to the regulatory-authorities service', () => {
        appController.selectService(response, 'regulatory-authorities');

        expect(response.redirect).toHaveBeenCalledWith(
          '/regulatory-authorities',
        );
      });

      it('redirects to the annual-figures service', () => {
        appController.selectService(response, 'annual-figures');

        expect(response.redirect).toHaveBeenCalledWith('/annual-figures');
      });

      it('raises an error when called with an unexpected service', () => {
        expect(() => {
          appController.selectService(response, 'foo-bar');
        }).toThrowError(NotFoundException);
      });
    });
  });
});
