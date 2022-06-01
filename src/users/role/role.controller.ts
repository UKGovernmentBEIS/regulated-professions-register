import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Res,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { UsersService } from '../users.service';
import { UserPermission } from '../user-permission';
import { RoleDto } from './dto/role.dto';
import { Permissions } from '../../common/permissions.decorator';
import { EditTemplate } from './interfaces/edit-template';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { Role } from '../role';
import { I18nService } from 'nestjs-i18n';
import { Validator } from '../../helpers/validator';
import { ValidationFailedError } from '../../common/validation/validation-failed.error';
import { getPermissionsFromUser } from '../helpers/get-permissions-from-user.helper';
import { User } from '../user.entity';
import { RoleRadioButtonsPresenter } from '../presenters/role-radio-buttons.preseter';
import {
  getActionTypeFromUser,
  ActionType,
} from '../helpers/get-action-type-from-user';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { checkCanViewUser } from '../helpers/check-can-view-user';
import { getUserEditStepBackLink } from '../helpers/get-user-edit-step-back-link.helper';
import { UserEditSource } from '../users.controller';

@UseGuards(AuthenticationGuard)
@Controller('/admin/users')
export class RoleController {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18nService: I18nService,
  ) {}

  @Get(':id/role/edit')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @BackLink((request: Request) =>
    getUserEditStepBackLink(
      request.query,
      '/admin/users/:id/personal-details/edit',
    ),
  )
  async edit(
    @Res() res: Response,
    @Param('id') id,
    @Query('source') source: UserEditSource,
    @Req() request: RequestWithAppSession,
  ): Promise<void> {
    const user = await this.usersService.find(id);

    checkCanViewUser(request, user);

    return this.renderForm(
      res,
      user.serviceOwner,
      user.role,
      user.name,
      source,
      getActionTypeFromUser(user),
    );
  }

  @Post(':id/role')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @BackLink((request: Request) =>
    getUserEditStepBackLink(
      request.body,
      '/admin/users/:id/personal-details/edit',
    ),
  )
  async update(
    @Res() res: Response,
    @Param('id') id: string,
    @Body() permissionsDto,
    @Req() request: RequestWithAppSession,
  ): Promise<void> {
    const user = await this.usersService.find(id);

    checkCanViewUser(request, user);

    const validator = await Validator.validate(RoleDto, permissionsDto);
    const submittedValues = validator.obj;

    const role = submittedValues.role;

    if (!validator.valid()) {
      const errors = new ValidationFailedError(validator.errors).fullMessages();
      return this.renderForm(
        res,
        user.serviceOwner,
        role,
        user.name,
        submittedValues.source,
        getActionTypeFromUser(user),
        errors,
      );
    }

    const updatedUser: User = {
      ...user,
      role,
    };

    if (!getPermissionsFromUser(updatedUser)) {
      throw new Error('Attempting to assign invalid `role` to user');
    }

    await this.usersService.save(updatedUser);

    res.redirect(`/admin/users/${id}/confirm`);
  }

  private renderForm(
    res: Response,
    serviceOwner: boolean,
    role: Role | null,
    name: string,
    source: UserEditSource,
    action: ActionType,
    errors: object | undefined = undefined,
  ): void {
    const roleRadioButtonArgs = new RoleRadioButtonsPresenter(
      this.getAllowedRoles(serviceOwner),
      serviceOwner,
      role,
      this.i18nService,
    ).radioButtonArgs();

    const templateArgs: EditTemplate = {
      roleRadioButtonArgs,
      source,
      errors,
      action,
      name,
    };

    res.render('admin/users/role/edit', templateArgs);
  }

  private getAllowedRoles(serviceOwner: boolean): Role[] {
    return serviceOwner
      ? [Role.Administrator, Role.Registrar, Role.Editor]
      : [Role.Administrator, Role.Editor];
  }
}
