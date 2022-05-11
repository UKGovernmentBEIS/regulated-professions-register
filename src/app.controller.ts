import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from './common/authentication.guard';
import { BackLink } from './common/decorators/back-link.decorator';
import { RequestWithAppSession } from './common/interfaces/request-with-app-session.interface';
import { getActingUser } from './users/helpers/get-acting-user.helper';
import { getUserOrganisation } from './users/helpers/get-user-organisation';

@Controller()
export class AppController {
  @Get('/admin/dashboard')
  @UseGuards(AuthenticationGuard)
  @Render('admin/dashboard')
  adminDashboard(@Req() request: RequestWithAppSession) {
    const actingUser = getActingUser(request);

    return {
      organisation: getUserOrganisation(actingUser),
    };
  }

  @Get('/admin')
  @Render('admin/index')
  adminIndex(): void {
    // do nothing.
  }

  @Get('/admin/guidance')
  @Render('admin/pages/guidance')
  @BackLink('/admin/dashboard')
  adminGuidance(): void {
    // do nothing.
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

  @Get('/admin/decisions/guidance')
  @Render('admin/decisions/guidance')
  @BackLink('/admin/decisions')
  adminDecisionGuidance(): void {
    // do nothing
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
