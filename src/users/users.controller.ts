import {
  Controller,
  Get,
  Post,
  Param,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthenticationGuard } from '../common/authentication.guard';
import { ExternalUserCreationService } from './external-user-creation.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly externalUserCreationService: ExternalUserCreationService,
  ) {}

  @Get('/admin/users/new')
  @UseGuards(AuthenticationGuard)
  @Render('users/new')
  new(): object {
    return {};
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
  async confirm(@Param('id') id): Promise<User> {
    const user = await this.usersService.find(id);

    return user;
  }

  @Post('/admin/users/:id/confirm')
  @UseGuards(AuthenticationGuard)
  async complete(@Res() res, @Param('id') id): Promise<void> {
    const user = await this.usersService.find(id);
    const { email } = user;

    const externalResult =
      await this.externalUserCreationService.createExternalUser(email);
    user.externalIdentifier = externalResult.externalIdentifier;

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
}
