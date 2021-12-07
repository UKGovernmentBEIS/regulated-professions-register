import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth0UserCreationService } from './auth0-user-creation.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { NullUserCreationService } from './null-user-creation-service';
import { PersonalDetailsController } from './personal-details.controller';
import { UsersController } from './users.controller';

import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UsersService,
    {
      provide: ExternalUserCreationService,
      useValue:
        process.env.NODE_ENV == 'test'
          ? new NullUserCreationService()
          : new Auth0UserCreationService(),
    },
  ],
  controllers: [UsersController, PersonalDetailsController],
  exports: [UsersService],
})
export class UsersModule {}
