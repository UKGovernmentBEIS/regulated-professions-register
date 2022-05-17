import {
  Controller,
  Get,
  Post,
  Param,
  Render,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../common/authentication.guard';
import { Auth0Service } from './auth0.service';
import { User } from './user.entity';
import { UserPermission } from './user-permission';
import { UsersPresenter } from './presenters/users.presenter';
import { UsersService } from './users.service';
import { IndexTemplate } from './interfaces/index-template';
import { ShowTemplate } from './interfaces/show-template';
import { ConfirmTemplate } from './interfaces/confirm-template';
import { Permissions } from '../common/permissions.decorator';
import { getActionTypeFromUser } from './helpers/get-action-type-from-user';

import { UserMailer } from './user.mailer';
import { BackLink } from '../common/decorators/back-link.decorator';
import { Response } from 'express';
import { RequestWithAppSession } from '../common/interfaces/request-with-app-session.interface';
import { getActingUser } from './helpers/get-acting-user.helper';
import { CompleteTemplate } from './interfaces/complete-template';
import { getUserOrganisation } from './helpers/get-user-organisation';
import { checkCanViewUser } from './helpers/check-can-view-user';

class UserAlreadyExistsError extends Error {}

@Controller()
@UseGuards(AuthenticationGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auth0Service: Auth0Service,
    private readonly i18nService: I18nService,
    private readonly userMailer: UserMailer,
  ) {}

  @Get('/admin/users')
  @Permissions(
    UserPermission.CreateUser,
    UserPermission.EditUser,
    UserPermission.DeleteUser,
  )
  @Render('admin/users/index')
  @BackLink('/admin/dashboard')
  async index(@Req() req: RequestWithAppSession): Promise<IndexTemplate> {
    const actingUser = getActingUser(req);

    const users = await (actingUser.serviceOwner
      ? this.usersService.allConfirmed()
      : this.usersService.allConfirmedForOrganisation(actingUser.organisation));

    const organisation = getUserOrganisation(actingUser);

    const usersPresenter = new UsersPresenter(users, this.i18nService);

    return {
      organisation,
      ...users,
      rows: usersPresenter.tableRows(),
    };
  }

  @Get('/admin/users/:id')
  @Permissions(UserPermission.EditUser, UserPermission.DeleteUser)
  @Render('admin/users/show')
  async show(
    @Param('id') id,
    @Req() request: RequestWithAppSession,
  ): Promise<ShowTemplate> {
    const user = await this.usersService.find(id);

    checkCanViewUser(request, user);

    return {
      ...user,
    };
  }

  @Post('/admin/users')
  @Permissions(UserPermission.CreateUser)
  async create(@Req() request: RequestWithAppSession, @Res() res: Response) {
    const actingUser = getActingUser(request);

    const organisation = actingUser.organisation;

    const newUser = await this.usersService.save({
      ...new User(),
      organisation,
    });

    if (actingUser.serviceOwner) {
      res.redirect(`/admin/users/${newUser.id}/organisation/edit`);
    } else {
      res.redirect(`/admin/users/${newUser.id}/personal-details/edit`);
    }
  }

  @Get('/admin/users/:id/confirm')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/confirm')
  @BackLink('/admin/users/:id/permissions/edit')
  async confirm(
    @Req() request: RequestWithAppSession,
    @Param('id') id,
  ): Promise<ConfirmTemplate> {
    const user = await this.usersService.find(id);
    const action = getActionTypeFromUser(user);

    checkCanViewUser(request, user);

    return {
      ...user,
      action,
    };
  }

  @Post('/admin/users/:id/confirm')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  async complete(
    @Res() res,
    @Param('id') id,
    @Req() request: RequestWithAppSession,
  ): Promise<void> {
    const user = await this.usersService.find(id);
    const action = getActionTypeFromUser(user);

    checkCanViewUser(request, user);

    if (action == 'new') {
      try {
        await this.createUserInAuth0(user);
      } catch (err) {
        if (err instanceof UserAlreadyExistsError) {
          return res.render('admin/users/confirm', {
            ...user,
            action,
            userAlreadyExists: true,
          } as ConfirmTemplate);
        }

        throw err;
      }
    }

    res.render('admin/users/complete', {
      ...user,
      action,
    } as CompleteTemplate);
  }

  async createUserInAuth0(user: User): Promise<void> {
    const externalResult = await this.auth0Service.createUser(user.email);

    user.externalIdentifier = externalResult.externalIdentifier;
    user.confirmed = true;

    const internalResult = await this.usersService.attemptAdd(user);

    if (
      externalResult.result === 'user-exists' &&
      internalResult === 'user-exists'
    ) {
      throw new UserAlreadyExistsError();
    } else if (externalResult.result === 'user-created') {
      await this.userMailer.confirmation(
        user,
        externalResult.passwordResetLink,
      );
    }
  }
}
