/* eslint @typescript-eslint/no-var-requires: "off" */

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import * as nunjucks from 'nunjucks';
import * as path from 'path';

import { AppModule } from './app.module';
import { AssetsHelper } from './helpers/assets.helper';
import { ValidationFailedError } from './validation/validation-failed.error';
import { oidc } from './middleware/oidc';
import { UnauthorizedExceptionFilter } from './authentication/unauthorised-exception.filter';

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
    noCache: process.env.NODE_ENV === 'local' ? true : false,
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
    require('express-session')({
      secret: process.env.APP_SECRET,
      resave: true,
      saveUninitialized: false,
    }),
  );
  app.use(oidc.router);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidationFailedError(validationErrors);
      },
    }),
  );

  app.useGlobalFilters(new UnauthorizedExceptionFilter());

  oidc.on('ready', async () => {
    await app.listen(3000);
  });
}
bootstrap();
