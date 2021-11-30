import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  Redirect,
  Render,
  Res,
  Session,
} from '@nestjs/common';
import { ValidationFailedError } from '../validation/validation-failed.error';
import { Validator } from '../helpers/validator';
import { User } from '../users/user.entity';
import { UserService } from '../users/user.service';
import { RegisterPersonalDetailsDto } from './dto/register-personal-details.dto';
import { RegisterSessionDto } from './dto/register-session.dto';
import { ExternalUserCreationService } from './external-user-creation.service';

const SESSION_KEY = 'registration';
const TOTAL_STEPS = 1;

@Controller('/register')
export class RegistrationController {
  constructor(
    private readonly userService: UserService,
    private readonly externalUserCreationService: ExternalUserCreationService,
  ) {}

  @Get('/start')
  @Render('registration/start')
  start(): object {
    return {};
  }

  @Post('/start')
  @Redirect('personal-details')
  startPost(): object {
    return {};
  }

  @Get('/personal-details')
  @Render('registration/personal-details')
  personalDetails(
    @Query('edit', new DefaultValuePipe(false), ParseBoolPipe) edit: boolean,
    @Session() session,
  ): object {
    const sessionDto = this.getSessionDto(session, edit ? TOTAL_STEPS : 0);

    if (this.getHighestStepSessionValidFor(sessionDto) >= 1) {
      return { edit: true, name: sessionDto.name, email: sessionDto.email };
    } else {
      return { edit: false, name: '', email: '' };
    }
  }

  @Post('/personal-details')
  async personalDetailsPost(
    @Body() registerPersonalDetailsDto,
    @Session() session,
    @Res() res,
  ): Promise<object> {
    const edit = registerPersonalDetailsDto.edit === 'true';

    // If this is the first step, start with a clean session
    if (!edit) {
      this.clearSession(session);
    }

    const sessionDto = this.getSessionDto(session, edit ? TOTAL_STEPS : 0);

    // Intentially don't use `ValidationExceptionFilter`, as we have additional
    // parameters to get into our template
    const validator = await Validator.validate(
      RegisterPersonalDetailsDto,
      registerPersonalDetailsDto,
    );

    if (!validator.valid()) {
      res.render('registration/personal-details', {
        edit,
        name: registerPersonalDetailsDto.name,
        email: registerPersonalDetailsDto.email,
        errors: new ValidationFailedError(validator.errors).fullMessages(),
      });
      return;
    }

    // Don't talk to Auth0 yet, but at least check our own DB
    if (await this.userService.findByEmail(registerPersonalDetailsDto.email)) {
      const errors = {
        email: { text: 'A user with this email address already exists' },
      };

      res.render('registration/personal-details', {
        edit,
        name: registerPersonalDetailsDto.name,
        email: registerPersonalDetailsDto.email,
        errors,
      });
      return;
    }

    sessionDto.name = registerPersonalDetailsDto.name;
    sessionDto.email = registerPersonalDetailsDto.email;

    res.redirect('confirm');

    return {};
  }

  @Get('/confirm')
  @Render('registration/confirm')
  confirm(@Session() session): object {
    const { email, name } = this.getSessionDto(session, TOTAL_STEPS);

    return { email, name };
  }

  @Post('/confirm')
  async confirmPost(@Session() session, @Res() res): Promise<object> {
    const sessionDto = this.getSessionDto(session, TOTAL_STEPS);

    const { email, name } = sessionDto;

    const externalResult =
      await this.externalUserCreationService.createExternalUser(email);

    if (externalResult.result == 'user-exists') {
      // In the case where the user already existed in Auth0, we expect they
      // *may* exist in our DB, so handle that case
      const internalResult = await this.userService.attemptAdd(
        new User(email, name, externalResult.externalIdentifier),
      );

      if (internalResult == 'user-exists') {
        res.render('registration/confirm', {
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
  @Render('registration/done')
  done(@Session() session): object {
    const sessionDto = this.getSessionDto(session, TOTAL_STEPS);

    return { email: sessionDto.email };
  }

  private getSessionDto(
    session: object,
    expectedCompletedSteps: number,
  ): RegisterSessionDto {
    if (!session[SESSION_KEY]) {
      session[SESSION_KEY] = new RegisterSessionDto();
    }
    const sessionDto = session[SESSION_KEY] as RegisterSessionDto;

    this.validateSessionForStep(sessionDto, expectedCompletedSteps);

    return sessionDto;
  }

  private validateSessionForStep(
    sessionDto: RegisterSessionDto,
    expectedCompletedSteps: number,
  ): void {
    const actualCompletedSteps = this.getHighestStepSessionValidFor(sessionDto);
    if (expectedCompletedSteps > actualCompletedSteps) {
      throw new Error(
        `Expected a step ${expectedCompletedSteps} session but received a step ${actualCompletedSteps} session`,
      );
    }
  }

  private getHighestStepSessionValidFor(
    sessionDto: RegisterSessionDto,
  ): number {
    if (sessionDto.name && sessionDto.email) {
      return 1;
    } else {
      return 0;
    }
  }

  private clearSession(session: object): void {
    delete session[SESSION_KEY];
  }
}
