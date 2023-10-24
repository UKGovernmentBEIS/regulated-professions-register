import {
  Controller,
  Get,
  Param,
  Render,
  Req,
  UseGuards,
  Delete,
  Redirect,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';

import { AuthenticationGuard } from '../common/authentication.guard';
import { Auth0Service } from './auth0.service';
import { UserPermission } from './user-permission';
import { UsersService } from './users.service';
import { ShowTemplate } from './interfaces/show-template';
import { Permissions } from '../common/permissions.decorator';
import { flashMessage } from '../common/flash-message';

@Controller()
@UseGuards(AuthenticationGuard)
export class UsersArchiveController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auth0Service: Auth0Service,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/admin/users/:id/archive')
  @Permissions(UserPermission.DeleteUser)
  @Render('admin/users/archive/new')
  async new(@Param('id') id): Promise<ShowTemplate> {
    const user = await this.usersService.find(id);

    return {
      ...user,
    };
  }

  @Delete('/admin/users/:id')
  @Permissions(UserPermission.DeleteUser)
  @Redirect('/admin/users')
  async delete(@Req() req, @Param('id') id): Promise<void> {
    const messageTitle = this.i18nService.translate<string>(
      'users.archive.confirmation.body',
    ) as string;
    const user = await this.usersService.find(id);

    await this.auth0Service.deleteUser(user.externalIdentifier).performLater();

    await this.usersService.save({
      ...user,
      archived: true,
      externalIdentifier: null,
    });

    const successMessage = flashMessage(messageTitle);

    req.flash('success', successMessage);
  }
}
