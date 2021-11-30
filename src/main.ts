import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

import * as path from 'path';

import { AppModule } from './app.module';
import { ValidationFailedError } from './validation/validation-failed.error';
import { UnauthorizedExceptionFilter } from './common/unauthorized-exception.filter';
import { AuthenticationMidleware } from './middleware/authentication.middleware';
import { nunjucksConfig } from './config/nunjucks.config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const authenticationMiddleware = new AuthenticationMidleware(app);
  const assets = path.join(__dirname, '..', 'public');

  const views = [
    path.join(__dirname, '..', 'views'),
    path.join(__dirname, '..', 'node_modules', 'govuk-frontend'),
  ];

  await nunjucksConfig(app, views);

  app.setBaseViewsDir(views);
  app.setViewEngine('njk');

  app.useStaticAssets(assets);

  app.use(authenticationMiddleware.auth());

  app.useGlobalFilters(new UnauthorizedExceptionFilter());
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
