import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Render,
  Res,
  UseGuards,
  Query,
} from '@nestjs/common';

import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { Validator } from '../../helpers/validator';
import { UsersService } from '../users.service';
import { UserPermission } from './../user-permission';
import { User } from './../user.entity';
import { PersonalDetailsDto } from './dto/personal-details.dto';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { EditTemplate } from './interfaces/edit-template';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { Request, Response } from 'express';

@Controller('/admin/users')
@UseGuards(AuthenticationGuard)
export class PersonalDetailsController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/personal-details/edit')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/personal-details/edit')
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/users/:id/confirm'
      : (request['appSession'].user as User).serviceOwner
      ? '/admin/users/:id/organisation/edit'
      : '/admin/users/new',
  )
  async edit(
    @Param('id') id,
    @Query('change') change: boolean,
  ): Promise<EditTemplate> {
    const user = await this.usersService.find(id);

    return {
      ...user,
      change: change,
    };
  }

  @Post(':id/personal-details')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @BackLink((request: Request) =>
    request.body.change === 'true'
      ? '/admin/users/:id/confirm'
      : (request['appSession'].user as User).serviceOwner
      ? '/admin/users/:id/organisation/edit'
      : '/admin/users/new',
  )
  async update(
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

    const submittedValues: PersonalDetailsDto = personalDetailsDto;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      this.renderWithErrors(res, submittedValues, errors);
      return;
    }

    const user = await this.usersService.find(id);

    const { email, name } = submittedValues;

    // Don't talk to Auth0 yet, but at least check our own DB
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser && existingUser.id !== user.id) {
      const errors = {
        email: { text: 'A user with this email address already exists' },
      };

      this.renderWithErrors(res, submittedValues, errors);
      return;
    }

    const updatedUser: User = {
      ...user,
      name,
      email,
    };

    await this.usersService.save(updatedUser);

    if (submittedValues.change === 'true') {
      res.redirect(`/admin/users/${id}/confirm`);
    } else {
      res.redirect(`/admin/users/${id}/role/edit`);
    }
  }

  private renderWithErrors(
    res: Response,
    personalDetailsDto: PersonalDetailsDto,
    errors: object,
  ): void {
    res.render('admin/users/personal-details/edit', {
      name: personalDetailsDto.name,
      email: personalDetailsDto.email,
      errors,
    });
  }
}
