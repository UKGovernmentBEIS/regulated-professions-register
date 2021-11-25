/* eslint @typescript-eslint/no-var-requires: "off" */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { auth } from 'express-openid-connect';

import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { AppModule } from './app.module';
import { AssetsHelper } from './helpers/assets.helper';
import { ValidationFailedError } from './validation/validation-failed.error';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const express = app.getHttpAdapter().getInstance();
  const entrypoints = require('../public/entrypoints.json');
  const assetsHelper = new AssetsHelper(entrypoints);

  const assets = path.join(__dirname, '..', 'public');
  const views = [
    path.join(__dirname, '..', 'views'),
    path.join(__dirname, '..', 'node_modules', 'govuk-frontend'),
  ];

  const nunjucksEnv = nunjucks.configure(views, {
    noCache: process.env.NODE_ENV === 'development' ? true : false,
    express: express,
  });

  nunjucksEnv.addGlobal(
    'encore_entry_link_tags',
    await assetsHelper.entryLinksTags(),
  );
  nunjucksEnv.addGlobal(
    'encore_entry_script_tags',
    await assetsHelper.entryScriptTags(),
  );

  app.useStaticAssets(assets);
  app.setBaseViewsDir(views);
  app.setViewEngine('njk');

  app.use(
    auth({
      issuerBaseURL: process.env['AUTH0_DOMAIN'],
      baseURL: process.env['HOST_URL'],
      clientID: process.env['AUTH0_CLIENT_ID'],
      clientSecret: process.env['AUTH0_CLIENT_SECRET'],
      secret: process.env['APP_SECRET'],
      authRequired: false,
      auth0Logout: true,
      authorizationParams: {
        response_type: 'code',
        scope: 'openid profile email',
      },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidationFailedError(validationErrors);
      },
    }),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
