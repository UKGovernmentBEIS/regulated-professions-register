import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import path from 'path';
import session from 'express-session';
import methodOverride from 'method-override';
import connectFlash from 'connect-flash';
import Rollbar from 'rollbar';

import { AppModule } from './app.module';
import { AuthenticationMidleware } from './middleware/authentication.middleware';
import { nunjucksConfig } from './config/nunjucks.config';

import { ValidationFailedError } from './validation/validation-failed.error';
import { HttpExceptionFilter } from './common/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const authenticationMiddleware = new AuthenticationMidleware(app);
  const assets = path.join(__dirname, '..', 'public');

  const views = [
    path.join(__dirname, '..', 'views'),
    path.join(__dirname, '..', 'node_modules', 'govuk-frontend'),
  ];

  // Add method-override to allow us to use PUT and DELETE methods
  app.use(methodOverride('_method'));

  await nunjucksConfig(app, views);

  app.setBaseViewsDir(views);
  app.setViewEngine('njk');

  app.useStaticAssets(assets);

  app.use(authenticationMiddleware.auth());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidationFailedError(validationErrors);
      },
    }),
  );

  app.use(
    session({
      secret: process.env.APP_SECRET,
      resave: false,
      saveUninitialized: false,
    }),
  );

  // Allow us to redirect with flash messages
  app.use(connectFlash());

  // Send errors to Rollbar in production
  if (process.env['NODE_ENV'] === 'production') {
    const rollbar = new Rollbar({
      accessToken: process.env['ROLLBAR_TOKEN'],
      captureUncaught: true,
      captureUnhandledRejections: true,
      payload: {
        environment: process.env['ENVIRONMENT'],
      },
    });
    app.use(rollbar.errorHandler());
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
