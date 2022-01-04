import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth0UserCreationService } from './auth0-user-creation.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { NullUserCreationService } from './null-user-creation-service';
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
  providers: [
    UsersService,
    UserMailer,
    {
      provide: ExternalUserCreationService,
      useValue:
        process.env.NODE_ENV == 'test'
          ? new NullUserCreationService()
          : new Auth0UserCreationService(),
    },
  ],
  controllers: [UsersController, PersonalDetailsController, RolesController],
  exports: [UsersService],
})
export class UsersModule {}
