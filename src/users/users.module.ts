import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth0Service } from './auth0.service';
import { PersonalDetailsController } from './personal-details/personal-details.controller';
import { RolesController } from './roles/roles.controller';

import { UsersController } from './users.controller';

import { User } from './user.entity';
import { UsersService } from './users.service';
import { UserMailer } from './user.mailer';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    BullModule.registerQueue({
      name: 'default',
    }),
  ],
  providers: [UsersService, UserMailer, Auth0Service],
  controllers: [UsersController, PersonalDetailsController, RolesController],
  exports: [UsersService],
})
export class UsersModule {}
