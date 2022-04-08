import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.test' });

import path from 'path';
import { nunjucksConfig } from '../../src/config/nunjucks.config';
import { createMockI18nService } from '../../src/testutils/create-mock-i18n-service';

import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { NestExpressApplication } from '@nestjs/platform-express';

export async function nunjucksEnvironment() {
  const i18nService = createMockI18nService();

  const module: TestingModule = await Test.createTestingModule({
    providers: [{ provide: I18nService, useValue: i18nService }],
  }).compile();

  const views = [
    path.join(__dirname, '..', '..', 'views'),
    path.join(__dirname, '..', '..', 'node_modules', 'govuk-frontend'),
  ];

  const app = module.createNestApplication<NestExpressApplication>();

  return await nunjucksConfig(app, views);
}
