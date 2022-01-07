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
import { UsersPresenter } from './users.presenter';
import { UsersService } from './users.service';
import { IndexTemplate } from './interfaces/index-template';
import { ShowTemplate } from './interfaces/show-template';

import { UserPresenter } from './user.presenter';
import { UserMailer } from './user.mailer';
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auth0Service: Auth0Service,
    private readonly i18nService: I18nService,
    private readonly userMailer: UserMailer,
  ) {}

  @Get('/admin/users')
  @UseGuards(AuthenticationGuard)
  @Render('users/index')
  async index(@Req() req): Promise<IndexTemplate> {
    const users = await this.usersService.where({ confirmed: true });
    const usersPresenter = new UsersPresenter(users, this.i18nService);

    return {
      ...users,
      messages: req.flash('info'),
      rows: usersPresenter.tableRows(),
    };
  }

  @Get('/admin/users/new')
  @UseGuards(AuthenticationGuard)
  @Render('users/new')
  new(): object {
    return {};
  }

  @Get('/admin/users/:id')
  @UseGuards(AuthenticationGuard)
  @Render('users/show')
  async show(@Param('id') id): Promise<ShowTemplate> {
    const user = await this.usersService.find(id);
    const userPresenter = new UserPresenter(user, this.i18nService);

    return {
      ...user,
      roleList: await userPresenter.roleList(),
    };
  }

  @Post('/admin/users')
  @UseGuards(AuthenticationGuard)
  async create(@Res() res) {
    const user = await this.usersService.save(new User());

    res.redirect(`/admin/users/${user.id}/personal-details/edit`);
  }

  @Get('/admin/users/:id/confirm')
  @UseGuards(AuthenticationGuard)
  @Render('users/confirm')
  async confirm(@Param('id') id): Promise<ShowTemplate> {
    const user = await this.usersService.find(id);
    const userPresenter = new UserPresenter(user, this.i18nService);

    return {
      ...user,
      roleList: await userPresenter.roleList(),
    };
  }

  @Post('/admin/users/:id/confirm')
  @UseGuards(AuthenticationGuard)
  async complete(@Res() res, @Param('id') id): Promise<void> {
    const user = await this.usersService.find(id);
    const { email } = user;

    const externalResult = await this.auth0Service.createUser(email);
    user.externalIdentifier = externalResult.externalIdentifier;
    user.confirmed = true;

    if (externalResult.result == 'user-exists') {
      // In the case where the user already existed in Auth0, we expect they
      // *may* exist in our DB, so handle that case
      const internalResult = await this.usersService.attemptAdd(user);

      if (internalResult == 'user-exists') {
        res.render('users/confirm', {
          ...user,
          userAlreadyExists: true,
        });
        return;
      }
    } else {
      // In the case where the user didn't already exist in Auth0, assume they
      // don't exist already in our DB. If they're in our DB, they have an
      // identifier from Auth0, so it'd be very weird if they're *not* in Auth0
      await this.usersService.save(user);
      await this.userMailer.confirmation(
        user,
        externalResult.passwordResetLink,
      );
    }

    res.redirect('done');
  }

  @Get('/admin/users/:id/done')
  @UseGuards(AuthenticationGuard)
  @Render('users/done')
  async done(@Param('id') id): Promise<User> {
    const user = await this.usersService.find(id);

    return user;
  }

  @Delete('/admin/users/:id')
  @UseGuards(AuthenticationGuard)
  @Redirect('/admin/users')
  async delete(@Req() req, @Param('id') id): Promise<void> {
    req.flash(
      'info',
      await this.i18nService.translate('users.form.delete.successMessage'),
    );
    const user = await this.usersService.find(id);

    await this.auth0Service.deleteUser(user.externalIdentifier).performLater();

    await this.usersService.delete(id);
  }
}
