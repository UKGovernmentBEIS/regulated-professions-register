import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import path from 'path';
import session from 'express-session';
import methodOverride from 'method-override';
import connectFlash from 'connect-flash';
import basicAuth from 'express-basic-auth';

import { AppModule } from './app.module';
import { AuthenticationMidleware } from './middleware/authentication.middleware';
import { nunjucksConfig } from './config/nunjucks.config';
import { globalLocals } from './common/global-locals';

import { ValidationFailedError } from './common/validation/validation-failed.error';
import { GlobalExceptionFilter } from './common/global-exception.filter';

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

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new ValidationFailedError(validationErrors);
      },
      skipUndefinedProperties: true,
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

  // Add global variables to the application to be used in the templates
  app.use(globalLocals);

  // Add basic auth to the application if the environment variables are set
  if (
    process.env['BASIC_AUTH_USERNAME'] &&
    process.env['BASIC_AUTH_PASSWORD']
  ) {
    app.use(
      basicAuth({
        users: {
          [process.env['BASIC_AUTH_USERNAME']]:
            process.env['BASIC_AUTH_PASSWORD'],
        },
        challenge: true,
        realm: process.env['HOST_URL'],
      }),
    );
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
