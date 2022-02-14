import {
  Controller,
  Get,
  Post,
  Param,
  Render,
  Res,
  Req,
  UseGuards,
  Delete,
  Redirect,
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
import { flashMessage } from '../common/flash-message';
import { getActionTypeFromUser } from './helpers/get-action-type-from-user';

import { UserMailer } from './user.mailer';
import { BackLink } from '../common/decorators/back-link.decorator';
import { Response } from 'express';
import { RequestWithAppSession } from '../common/interfaces/request-with-app-session.interface';

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
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/index')
  @BackLink('/admin')
  async index(@Req() req: RequestWithAppSession): Promise<IndexTemplate> {
    const actingUser = req.appSession.user;

    const users = await (actingUser.serviceOwner
      ? this.usersService.allConfirmed()
      : this.usersService.allConfirmedForOrganisation(actingUser.organisation));

    const usersPresenter = new UsersPresenter(users);

    return {
      ...users,
      rows: usersPresenter.tableRows(),
    };
  }

  @Get('/admin/users/new')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/new')
  @BackLink('/admin/users')
  new(): object {
    return {};
  }

  @Get('/admin/users/:id')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/show')
  async show(@Param('id') id): Promise<ShowTemplate> {
    const user = await this.usersService.find(id);

    return {
      ...user,
    };
  }

  @Post('/admin/users')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  async create(@Req() request: RequestWithAppSession, @Res() res: Response) {
    const actingUser = request.appSession.user as User;

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
  @Permissions(UserPermission.CreateUser)
  @Render('admin/users/confirm')
  @BackLink('/admin/users/:id/permissions/edit')
  async confirm(@Param('id') id): Promise<ConfirmTemplate> {
    const user = await this.usersService.find(id);
    const action = getActionTypeFromUser(user);

    return {
      ...user,
      action,
    };
  }

  @Post('/admin/users/:id/confirm')
  @Permissions(UserPermission.CreateUser)
  async complete(@Res() res, @Param('id') id): Promise<void> {
    const user = await this.usersService.find(id);
    const action = getActionTypeFromUser(user);

    if (action == 'new') {
      try {
        await this.createUserInAuth0(user);
      } catch (err) {
        if (err instanceof UserAlreadyExistsError) {
          return res.render('admin/users/confirm', {
            ...user,
            userAlreadyExists: true,
          });
        }

        throw err;
      }
    }

    await this.usersService.save({
      ...user,
      confirmed: true,
    });

    res.render('admin/users/complete', {
      ...user,
      action,
    });
  }

  @Delete('/admin/users/:id')
  @Permissions(UserPermission.DeleteUser)
  @Redirect('/admin/users')
  async delete(@Req() req, @Param('id') id): Promise<void> {
    const messageTitle = await this.i18nService.translate(
      'users.form.delete.successMessage',
    );
    const user = await this.usersService.find(id);
    const successMessage = flashMessage(messageTitle);

    req.flash('success', successMessage);

    await this.auth0Service.deleteUser(user.externalIdentifier).performLater();

    await this.usersService.delete(id);
  }

  async createUserInAuth0(user: User): Promise<void> {
    const externalResult = await this.auth0Service.createUser(user.email);

    user.externalIdentifier = externalResult.externalIdentifier;

    if (externalResult.result == 'user-exists') {
      const internalResult = await this.usersService.attemptAdd({
        ...user,
        confirmed: true,
      });

      if (internalResult == 'user-exists') {
        throw new UserAlreadyExistsError();
      }
    } else {
      await this.userMailer.confirmation(
        user,
        externalResult.passwordResetLink,
      );
    }
  }
}
