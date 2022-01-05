process.env.NODE_ENV ||= 'development';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';
import { BullModule } from '@nestjs/bull';
import { LoggerModule } from 'nestjs-rollbar';

import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailerConsumer } from './common/mailer.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProfessionsModule } from './professions/professions.module';
import { LegislationsModule } from './legislations/legislations.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { IndustriesModule } from './industries/industries.module';

import dbConfiguration from './config/db.config';

const imports = [
  ConfigModule.forRoot({
    isGlobal: true,
    load: [dbConfiguration],
  }),
  TypeOrmModule.forRootAsync({
    inject: [ConfigService],
    useFactory: async (configService: ConfigService) => ({
      ...(await configService.get('database')),
    }),
  }),
  I18nModule.forRoot({
    fallbackLanguage: 'en',
    parser: I18nJsonParser,
    parserOptions: {
      path: path.join(__dirname, '/i18n/'),
      watch: process.env.NODE_ENV === 'development',
    },
  }),
  BullModule.forRoot({
    redis: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT || 6379),
    },
  }),
  BullModule.registerQueue({
    name: 'default',
  }),
  UsersModule,
  ProfessionsModule,
  LegislationsModule,
  OrganisationsModule,
  IndustriesModule,
];

// Only include Rollbar in production
if (process.env['NODE_ENV'] === 'production') {
  imports.push(
    LoggerModule.forRoot({
      accessToken: process.env['ROLLBAR_TOKEN'],
      environment: process.env['ENVIRONMENT'],
    }),
  );
}

@Module({
  imports: imports,
  controllers: [AppController],
  providers: [AppService, MailerConsumer],
})
export class AppModule {}
