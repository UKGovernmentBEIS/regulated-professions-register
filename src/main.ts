import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import path from 'path';
import session from 'express-session';
import methodOverride from 'method-override';
import connectFlash from 'connect-flash';

import { AppModule } from './app.module';
import { AuthenticationMidleware } from './middleware/authentication.middleware';
import { nunjucksConfig } from './config/nunjucks.config';
import { globalLocals } from './common/global-locals';

import { ValidationFailedError } from './common/validation/validation-failed.error';
import { GlobalExceptionFilter } from './common/global-exception.filter';
import { redirectToCanonicalHostname } from './middleware/redirect-to-canonical-hostname';
import { getDomain } from './helpers/get-domain.helper';
import RedisStore from 'connect-redis';
import Redis from 'ioredis';
import redisConfig from './config/redis.config';

import { JsonLogger } from './json-logger';

async function bootstrap() {
  const logger =
    process.env['ENVIRONMENT'] !== 'development'
      ? new JsonLogger()
      : new Logger();

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
  });
  const authenticationMiddleware = new AuthenticationMidleware(app);
  const assets = path.join(__dirname, '..', 'public');

  const views = [
    path.join(__dirname, '..', 'views'),
    path.join(__dirname, '..', 'node_modules', 'govuk-frontend/dist'),
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
      forbidUnknownValues: false,
    }),
  );

  const redisClient = new Redis(redisConfig().redis);

  const production = process.env['NODE_ENV'] === 'production';

  if (production) {
    app.set('trust proxy', 1);
  }

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env['APP_SECRET'],
      resave: false,
      saveUninitialized: false,
      proxy: production,
      cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        domain: getDomain(process.env['HOST_URL']),
        secure: production,
      },
    }),
  );

  // Allow us to redirect with flash messages
  app.use(connectFlash());

  // Add global variables to the application to be used in the templates
  app.use(globalLocals);

  if (process.env['CANONICAL_HOSTNAME']) {
    app.use(redirectToCanonicalHostname);
  }

  await app.listen(process.env['PORT'] || 3000);
}
bootstrap();
