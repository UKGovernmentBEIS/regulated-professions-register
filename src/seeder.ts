process.env.NODE_ENV ||= 'development';

import { seeder } from 'nestjs-seeder';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService, ConfigModule } from '@nestjs/config';

import { User } from './users/user.entity';
import { UsersSeeder } from './users/users.seeder';
import { Industry } from './industries/industry.entity';
import { IndustriesSeeder } from './industries/industries.seeder';

import dbConfiguration from './config/db.config';
import { Qualification } from './qualifications/qualification.entity';
import { Legislation } from './legislations/legislation.entity';
import { Profession } from './professions/profession.entity';
import { QualificationsSeeder } from './qualifications/qualifications.seeder';
import { LegislationsSeeder } from './legislations/legislations.seeder';
import { ProfessionsSeeder } from './professions/professions.seeder';
import { OrganisationsSeeder } from './organisations/organisations.seeder';
import { Organisation } from './organisations/organisation.entity';
import { OrganisationVersion } from './organisations/organisation-version.entity';

seeder({
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
    TypeOrmModule.forFeature([
      User,
      Industry,
      Qualification,
      Legislation,
      OrganisationVersion,
      Organisation,
      Profession,
    ]),
  ],
}).run([
  UsersSeeder,
  IndustriesSeeder,
  QualificationsSeeder,
  LegislationsSeeder,
  OrganisationsSeeder,
  ProfessionsSeeder,
]);
