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
  UseFilters,
} from '@nestjs/common';
import { ValidationExceptionFilter } from '../validation/validation-exception.filter';
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
  name(@Query('edit', new DefaultValuePipe(false), ParseBoolPipe) edit: boolean, @Session() session): object {
    const sessionDto = this.getSessionDto(
      session,
      edit ? TOTAL_STEPS : 0,
    );

    if (this.getHighestStepSessionValidFor(sessionDto) >= 1) {
      return { edit: true, name: sessionDto.name, email: sessionDto.email };
    } else {
      return { edit: false, name: '', email: '' };
    }
  }

  @Post('/personal-details')
  @UseFilters(
    new ValidationExceptionFilter('registration/personal-details', 'unused'),
  )
  namePost(
    @Body() registerNameDto: RegisterPersonalDetailsDto,
    @Session() session,
    @Res() res,
  ): object {
    if (registerNameDto.edit !== 'true') {
      this.clearSession(session);
    }

    const sessionDto = this.getSessionDto(session, 0);
    sessionDto.name = registerNameDto.name;
    sessionDto.email = registerNameDto.email;

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
  @Redirect('done')
  async confirmPost(@Session() session): Promise<object> {
    const sessionDto = this.getSessionDto(session, TOTAL_STEPS);

    const { email, name } = sessionDto;

    const result = await this.externalUserCreationService.createExternalUser(
      email,
    );

    if (result.result == 'user-created') {
      this.userService.add(new User(email, name, result.externalIdentifier));
    } else {
      // Possible race condition - wrap in transaction?
      if (
        !(await this.userService.findByExternalIdentifier(
          result.externalIdentifier,
        ))
      ) {
        this.userService.add(new User(email, name, result.externalIdentifier));
      } else {
        // TODO: Redirect to a "user exists" page
        throw new Error('User already exists');
      }
    }

    return {};
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
