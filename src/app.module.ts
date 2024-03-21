process.env.NODE_ENV ||= 'development';

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { BullModule } from '@nestjs/bull';

import * as path from 'path';

import { AppController } from './app.controller';
import { MailerConsumer } from './common/mailer.consumer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProfessionsModule } from './professions/professions.module';
import { LegislationsModule } from './legislations/legislations.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { IndustriesModule } from './industries/industries.module';

import dbConfiguration from './config/db.config';
import redisConfiguration from './config/redis.config';
import basicAuth from 'express-basic-auth';
import { SearchController as ProfessionSearchController } from './professions/search/search.controller';
import { SearchController as OrganisationSearchController } from './organisations/search/search.controller';
import { OrganisationsController } from './organisations/organisations.controller';
import { ProfessionsController } from './professions/professions.controller';
import { LandingController } from './landing/landing.controller';
import { DecisionsModule } from './decisions/decisions.module';

import { FeedbackModule } from './feedback/feedback.module';
import { FeedbackController } from './feedback/feedback.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [dbConfiguration, redisConfiguration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...(await configService.get('database')),
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      resolvers: [AcceptLanguageResolver],
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: process.env.NODE_ENV === 'development',
      },
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        ...(await configService.get('redis')),
      }),
    }),
    BullModule.registerQueue({
      name: 'default',
    }),
    UsersModule,
    ProfessionsModule,
    LegislationsModule,
    OrganisationsModule,
    IndustriesModule,
    DecisionsModule,
    FeedbackModule,
  ],
  controllers: [AppController, LandingController, FeedbackController],
  providers: [MailerConsumer],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    if (
      process.env['BASIC_AUTH_USERNAME'] &&
      process.env['BASIC_AUTH_PASSWORD']
    ) {
      consumer
        .apply(
          basicAuth({
            users: {
              [process.env['BASIC_AUTH_USERNAME']]:
                process.env['BASIC_AUTH_PASSWORD'],
            },
            challenge: true,
            realm: process.env['HOST_URL'],
          }),
        )
        .forRoutes(
          LandingController,
          OrganisationsController,
          ProfessionsController,
          ProfessionSearchController,
          OrganisationSearchController,
        );
    }
  }
}
