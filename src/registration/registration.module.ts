import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { Auth0UserCreationService } from './auth0-user-creation.service';
import { ExternalUserCreationService } from './external-user-creation.service';
import { NullUserCreationService } from './null-user-creation-service';
import { RegistrationController } from './registration.controller';

@Module({
  imports: [UsersModule],
  controllers: [RegistrationController],
  providers: [
    {
      provide: ExternalUserCreationService,
      useValue:
        process.env.NODE_ENV == 'test'
          ? new NullUserCreationService()
          : new Auth0UserCreationService(),
    },
  ],
})
export class RegistrationModule {}
