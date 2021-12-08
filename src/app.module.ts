process.env.NODE_ENV ||= 'development';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { I18nModule, I18nJsonParser } from 'nestjs-i18n';

import * as path from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProfessionsModule } from './professions/professions.module';
import { LegislationsModule } from './legislations/legislations.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { IndustriesModule } from './industries/industries.module';

import dbConfiguration from './config/db.config';

@Module({
  imports: [
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
    UsersModule,
    ProfessionsModule,
    LegislationsModule,
    OrganisationsModule,
    IndustriesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
