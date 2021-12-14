import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ValidationFailedError } from '../../validation/validation-failed.error';
import { Validator } from '../../helpers/validator';
import { UsersService } from '../users.service';
import { User } from '../user.entity';
import { PersonalDetailsDto } from '../dto/personal-details.dto';
import { AuthenticationGuard } from '../../common/authentication.guard';

@Controller('/admin/users')
export class PersonalDetailsController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/personal-details/edit')
  @UseGuards(AuthenticationGuard)
  @Render('users/personal-details/edit')
  async edit(@Param('id') id): Promise<User> {
    const user = this.usersService.find(id);

    return user;
  }

  @Post(':id/personal-details')
  @UseGuards(AuthenticationGuard)
  async create(
    @Body() personalDetailsDto,
    @Res() res,
    @Param('id') id,
  ): Promise<void> {
    // Intentially don't use `ValidationExceptionFilter`, as we have additional
    // parameters to get into our template
    const validator = await Validator.validate(
      PersonalDetailsDto,
      personalDetailsDto,
    );

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      this.renderWithErrors(res, personalDetailsDto, errors);
      return;
    }

    // Don't talk to Auth0 yet, but at least check our own DB
    if (await this.usersService.findByEmail(personalDetailsDto.email)) {
      const errors = {
        email: { text: 'A user with this email address already exists' },
      };

      this.renderWithErrors(res, personalDetailsDto, errors);
      return;
    }

    const user = await this.usersService.find(id);
    const updated = Object.assign(user, personalDetailsDto);

    await this.usersService.save(updated);

    res.redirect(`/admin/users/${id}/confirm`);
  }

  private renderWithErrors(
    res: any,
    personalDetailsDto: PersonalDetailsDto,
    errors: object,
  ): void {
    res.render('users/personal-details/edit', {
      name: personalDetailsDto.name,
      email: personalDetailsDto.email,
      errors,
    });
  }
}
