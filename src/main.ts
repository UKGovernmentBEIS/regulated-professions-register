import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
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
import connectRedis from 'connect-redis';
import Redis from 'ioredis';
import redisConfig from './config/redis.config';

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

  const redisClient = new Redis(redisConfig().redis);
  const RedisStore = connectRedis(session);

  app.use(
    session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env['APP_SECRET'],
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000,
        domain: getDomain(process.env['HOST_URL']),
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
