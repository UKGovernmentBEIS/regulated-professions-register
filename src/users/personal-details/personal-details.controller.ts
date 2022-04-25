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
  Req,
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
import { Response } from 'express';
import {
  getActionTypeFromUser,
  ActionType,
} from '../helpers/get-action-type-from-user';
import { getActingUser } from '../helpers/get-acting-user.helper';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanViewUser } from '../helpers/check-can-view-user';

@Controller('/admin/users')
@UseGuards(AuthenticationGuard)
export class PersonalDetailsController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/personal-details/edit')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/personal-details/edit')
  @BackLink((request: RequestWithAppSession) =>
    getBackLink(request, request.query),
  )
  async edit(
    @Param('id') id,
    @Query('change') change: boolean,
    @Req() request: RequestWithAppSession,
  ): Promise<EditTemplate> {
    const user = await this.usersService.find(id);
    const action = getActionTypeFromUser(user);

    checkCanViewUser(request, user);

    return {
      ...user,
      action,
      change,
    };
  }

  @Post(':id/personal-details')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @BackLink((request: RequestWithAppSession) =>
    getBackLink(request, request.body),
  )
  async update(
    @Body() personalDetailsDto,
    @Res() res,
    @Param('id') id,
    @Req() request: RequestWithAppSession,
  ): Promise<void> {
    // Intentially don't use `ValidationExceptionFilter`, as we have additional
    // parameters to get into our template
    const validator = await Validator.validate(
      PersonalDetailsDto,
      personalDetailsDto,
    );
    const submittedValues = validator.obj;

    const user = await this.usersService.find(id);
    const action = getActionTypeFromUser(user);

    checkCanViewUser(request, user);

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      this.renderWithErrors(res, submittedValues, errors, action);
      return;
    }

    const { email, name } = submittedValues;

    // Don't talk to Auth0 yet, but at least check our own DB
    const existingUser = await this.usersService.findByEmail(email);

    if (existingUser && existingUser.id !== user.id) {
      const errors = {
        email: { text: 'users.form.errors.email.alreadyExists' },
      };

      this.renderWithErrors(res, submittedValues, errors, action);
      return;
    }

    const updatedUser: User = {
      ...user,
      name,
      email,
    };

    await this.usersService.save(updatedUser);

    if (submittedValues.change) {
      res.redirect(`/admin/users/${id}/confirm`);
    } else {
      res.redirect(`/admin/users/${id}/role/edit`);
    }
  }

  private renderWithErrors(
    res: Response,
    personalDetailsDto: PersonalDetailsDto,
    errors: object,
    action: ActionType,
  ): void {
    res.render('admin/users/personal-details/edit', {
      name: personalDetailsDto.name,
      email: personalDetailsDto.email,
      errors,
      action,
    });
  }
}

function getBackLink(
  request: RequestWithAppSession,
  values: Record<string, any>,
): string {
  const change = values.change;
  const serviceOwner = getActingUser(request).serviceOwner;

  if (change) {
    return '/admin/users/:id/confirm';
  } else {
    return serviceOwner ? '/admin/users/:id/organisation/edit' : '/admin/users';
  }
}
