import {
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Res,
  Session,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../common/authentication.guard';
import { ExternalUserCreationService } from './external-user-creation.service';
import {
  UserCreationFlowSession,
  UserCreationFlowStep,
} from './helpers/user-creation-flow-session.helper';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly externalUserCreationService: ExternalUserCreationService,
  ) {}

  @Get('/admin/users/new')
  @UseGuards(AuthenticationGuard)
  @Render('users/new')
  new(): object {
    return {};
  }

  @Post('/admin/users/new')
  @UseGuards(AuthenticationGuard)
  @Redirect('new/personal-details')
  newPost(@Session() session): object {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      UserCreationFlowStep.Any,
    );

    userCreationFlowSession.resetSession();

    return {};
  }

  @Get('/admin/users/new/confirm')
  @UseGuards(AuthenticationGuard)
  @Render('users/confirm')
  confirm(@Session() session): object {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      UserCreationFlowStep.AllDetailsEntered,
    );
    const { email, name } = userCreationFlowSession.sessionDto;

    return { email, name };
  }

  @Post('/admin/users/new/confirm')
  @UseGuards(AuthenticationGuard)
  async create(@Session() session, @Res() res): Promise<object> {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      UserCreationFlowStep.AllDetailsEntered,
    );
    const { email, name } = userCreationFlowSession.sessionDto;

    const externalResult =
      await this.externalUserCreationService.createExternalUser(email);

    if (externalResult.result == 'user-exists') {
      // In the case where the user already existed in Auth0, we expect they
      // *may* exist in our DB, so handle that case
      const internalResult = await this.usersService.attemptAdd(
        new User(email, name, externalResult.externalIdentifier),
      );

      if (internalResult == 'user-exists') {
        res.render('users/confirm', {
          email,
          name,
          userAlreadyExists: true,
        });
        return;
      }
    } else {
      // In the case where the user didn't already exist in Auth0, assume they
      // don't exist already in our DB. If they're in our DB, they have an
      // identifier from Auth0, so it'd be very weird if they're *not* in Auth0
      await this.usersService.add(
        new User(email, name, externalResult.externalIdentifier),
      );

      const sessionDto = userCreationFlowSession.sessionDto;
      sessionDto.userCreated = true;
    }

    res.redirect('done');
  }

  @Get('/admin/users/new/done')
  @UseGuards(AuthenticationGuard)
  @Render('users/done')
  done(@Session() session): object {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      UserCreationFlowStep.UserCreated,
    );
    const { email } = userCreationFlowSession.sessionDto;

    return { email };
  }
}
