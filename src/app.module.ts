process.env.NODE_ENV ||= 'development';

import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProfessionModule } from './professions/profession.module';
import { LegislationModule } from './legislations/legislation.module';
import { OrganisationModule } from './organisations/organisation.module';

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
    UsersModule,
    ProfessionModule,
    LegislationModule,
    OrganisationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
