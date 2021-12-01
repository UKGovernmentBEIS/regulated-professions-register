import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Auth0UserCreationService } from './auth0-user-creation.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { NullUserCreationService } from './null-user-creation-service';
import { PersonalDetailsController } from './personal-details.controller';
import { UserController } from './user.controller';

import { User } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    UserService,
    {
      provide: ExternalUserCreationService,
      useValue:
        process.env.NODE_ENV == 'test'
          ? new NullUserCreationService()
          : new Auth0UserCreationService(),
    },
  ],
  controllers: [UserController, PersonalDetailsController],
  exports: [UserService],
})
export class UsersModule {}
