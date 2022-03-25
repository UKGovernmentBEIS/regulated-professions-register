import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from './common/authentication.guard';
import { RequestWithAppSession } from './common/interfaces/request-with-app-session.interface';
import { getActingUser } from './users/helpers/get-acting-user.helper';
import { getUserOrganisation } from './users/helpers/get-user-organisation';
@Controller()
export class AppController {
  @Get('/admin')
  @UseGuards(AuthenticationGuard)
  @Render('admin/dashboard')
  admin(@Req() request: RequestWithAppSession) {
    const actingUser = getActingUser(request);

    return {
      organisation: getUserOrganisation(actingUser),
    };
  }

  @Get('/cookies')
  @Render('pages/cookies')
  cookies() {
    // do nothing.
  }

  @Get('/privacy-policy')
  @Render('pages/privacy-policy')
  privacyPolicy() {
    // do nothing.
  }

  @Get('/accessibility')
  @Render('pages/accessibility')
  accessibility() {
    // do nothing.
  }

  @Get('/disclaimer')
  @Render('pages/data-disclaimer')
  dataDisclaimer() {
    // do nothing.
  }

  @Get('/health-check')
  healthCheck() {
    return {
      status: 'OK',
      git_sha: process.env['CURRENT_SHA'],
      built_at: process.env['TIME_OF_BUILD'],
    };
  }
}
