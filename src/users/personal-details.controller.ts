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
  UseGuards,
} from '@nestjs/common';
import { ValidationFailedError } from '../validation/validation-failed.error';
import { Validator } from '../helpers/validator';
import { UsersService } from './users.service';
import { PersonalDetailsDto } from './dto/personal-details.dto';
import {
  UserCreationFlowSession,
  UserCreationFlowStep,
} from './helpers/user-creation-flow-session.helper';
import { AuthenticationGuard } from '../common/authentication.guard';

@Controller('/admin/user/create-new-user/personal-details')
export class PersonalDetailsController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(AuthenticationGuard)
  @Render('users/personal-details/new')
  new(
    @Query('edit', new DefaultValuePipe(false), ParseBoolPipe) edit: boolean,
    @Session() session,
  ): object {
    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      edit
        ? UserCreationFlowStep.AllDetailsEntered
        : UserCreationFlowStep.PersonalDetails - 1,
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
  @UseGuards(AuthenticationGuard)
  async create(
    @Body() personalDetailsDto,
    @Session() session,
    @Res() res,
  ): Promise<object> {
    const edit = personalDetailsDto.edit === 'true';

    const userCreationFlowSession = new UserCreationFlowSession(
      session,
      edit
        ? UserCreationFlowStep.AllDetailsEntered
        : UserCreationFlowStep.PersonalDetails - 1,
    );

    // Intentially don't use `ValidationExceptionFilter`, as we have additional
    // parameters to get into our template
    const validator = await Validator.validate(
      PersonalDetailsDto,
      personalDetailsDto,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      this.renderWithErrors(res, personalDetailsDto, edit, errors);
      return;
    }

    // Don't talk to Auth0 yet, but at least check our own DB
    if (await this.usersService.findByEmail(personalDetailsDto.email)) {
      const errors = {
        email: { text: 'A user with this email address already exists' },
      };

      this.renderWithErrors(res, personalDetailsDto, edit, errors);
      return;
    }

    const sessionDto = userCreationFlowSession.sessionDto;

    sessionDto.name = personalDetailsDto.name;
    sessionDto.email = personalDetailsDto.email;

    res.redirect('confirm');
  }

  private renderWithErrors(
    res: any,
    personalDetailsDto: PersonalDetailsDto,
    edit: boolean,
    errors: object,
  ): void {
    res.render('users/personal-details/new', {
      name: personalDetailsDto.name,
      email: personalDetailsDto.email,
      edit,
      errors,
    });
  }
}
