import {
  Controller,
  Get,
  Post,
  Redirect,
  Render,
  Res,
  Session,
} from '@nestjs/common';
import { ExternalUserCreationService } from './external-user-creation.service';
import {
  UserCreationFlowSession,
  UserCreationFlowStep,
} from './helpers/user-creation-flow-session.helper';
import { User } from './user.entity';
import { UserService } from './user.service';

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly externalUserCreationService: ExternalUserCreationService,
  ) {}

  @Get('/start')
  @Render('user/start')
  start(): object {
    return {};
  }

  @Post('/start')
  @Redirect('personal-details')
  startPost(): object {
    return {};
  }

  @Get('/confirm')
  @Render('user/confirm')
  confirm(@Session() session): object {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      UserCreationFlowStep.Complete,
    );
    const { email, name } = userCreationFlowSession.sessionDto;

    return { email, name };
  }

  @Post('/confirm')
  async create(@Session() session, @Res() res): Promise<object> {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      UserCreationFlowStep.Complete,
    );
    const { email, name } = userCreationFlowSession.sessionDto;

    const externalResult =
      await this.externalUserCreationService.createExternalUser(email);

    if (externalResult.result == 'user-exists') {
      // In the case where the user already existed in Auth0, we expect they
      // *may* exist in our DB, so handle that case
      const internalResult = await this.userService.attemptAdd(
        new User(email, name, externalResult.externalIdentifier),
      );

      if (internalResult == 'user-exists') {
        res.render('user/confirm', {
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
      await this.userService.add(
        new User(email, name, externalResult.externalIdentifier),
      );
    }

    res.redirect('done');
  }

  @Get('/done')
  @Render('user/done')
  done(@Session() session): object {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      UserCreationFlowStep.Complete,
    );
    const { email } = userCreationFlowSession.sessionDto;

    return { email };
  }
}
