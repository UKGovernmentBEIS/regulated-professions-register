import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth0Service } from './auth0.service';
import { PersonalDetailsController } from './personal-details/personal-details.controller';
import { RoleController } from './role/role.controller';

import { UsersController } from './users.controller';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UserMailer } from './user.mailer';
import { BullModule } from '@nestjs/bull';
import { Auth0Consumer } from './auth0.consumer';
import { OrganisationController } from './organisation/organisation.controller';
import { OrganisationsService } from '../organisations/organisations.service';
import { Organisation } from '../organisations/organisation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([Organisation]),
    BullModule.registerQueue({
      name: 'default',
    }),
    BullModule.registerQueue({
      name: 'auth0',
    }),
  ],
  providers: [
    UsersService,
    OrganisationsService,
    UserMailer,
    Auth0Service,
    Auth0Consumer,
  ],
  controllers: [
    UsersController,
    OrganisationController,
    PersonalDetailsController,
    RoleController,
  ],
  exports: [UsersService],
})
export class UsersModule {}
