import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  ParseBoolPipe,
  Post,
  Query,
  Render,
  Res,
  Session,
} from '@nestjs/common';
import { ValidationFailedError } from '../validation/validation-failed.error';
import { Validator } from '../helpers/validator';
import { UserService } from './user.service';
import { PersonalDetailsDto } from './dto/personal-details.dto';
import {
  UserCreationFlowSession,
  UserCreationFlowStep,
} from './helpers/user-creation-flow-session.helper';

@Controller('/user/personal-details')
export class PersonalDetailsController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Render('user/personal-details')
  new(
    @Query('edit', new DefaultValuePipe(false), ParseBoolPipe) edit: boolean,
    @Session() session,
  ): object {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      edit ? UserCreationFlowStep.Complete : UserCreationFlowStep.Start,
    );

    if (
      userCreationFlowSession.hasCompletedStep(
        UserCreationFlowStep.PersonalDetails,
      )
    ) {
      const { email, name } = userCreationFlowSession.sessionDto;

      return { edit, name, email };
    } else {
      return { edit, name: '', email: '' };
    }
  }

  @Post()
  async create(
    @Body() personalDetailsDto,
    @Session() session,
    @Res() res,
  ): Promise<object> {
    const edit = personalDetailsDto.edit === 'true';

    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      edit ? UserCreationFlowStep.Complete : UserCreationFlowStep.Start,
    );

    // If this is the first step, start with a clean session
    if (!edit) {
      userCreationFlowSession.clearSession();
    }

    // Intentially don't use `ValidationExceptionFilter`, as we have additional
    // parameters to get into our template
    const validator = await Validator.validate(
      PersonalDetailsDto,
      personalDetailsDto,
    );

    if (!validator.valid()) {
      res.render('user/personal-details', {
        edit,
        name: personalDetailsDto.name,
        email: personalDetailsDto.email,
        errors: new ValidationFailedError(validator.errors).fullMessages(),
      });
      return;
    }

    // Don't talk to Auth0 yet, but at least check our own DB
    if (await this.userService.findByEmail(personalDetailsDto.email)) {
      const errors = {
        email: { text: 'A user with this email address already exists' },
      };

      res.render('user/personal-details', {
        edit,
        name: personalDetailsDto.name,
        email: personalDetailsDto.email,
        errors,
      });
      return;
    }

    const sessionDto = userCreationFlowSession.sessionDto;

    sessionDto.name = personalDetailsDto.name;
    sessionDto.email = personalDetailsDto.email;

    res.redirect('confirm');
  }
}
