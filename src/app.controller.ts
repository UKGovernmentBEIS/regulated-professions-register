import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from './common/authentication.guard';
import { BackLink } from './common/decorators/back-link.decorator';
import { RequestWithAppSession } from './common/interfaces/request-with-app-session.interface';
import { getActingUser } from './users/helpers/get-acting-user.helper';
import { getUserOrganisation } from './users/helpers/get-user-organisation';

@Controller()
export class AppController {
  constructor(private readonly i18nService: I18nService) {}

  @Get('/admin/dashboard')
  @UseGuards(AuthenticationGuard)
  @Render('admin/dashboard')
  adminDashboard(@Req() request: RequestWithAppSession) {
    const actingUser = getActingUser(request);

    return {
      organisation: getUserOrganisation(actingUser, this.i18nService),
    };
  }

  @Get('/admin')
  @Render('admin/index')
  adminIndex(): void {
    // do nothing.
  }

  @Get('/admin/guidance')
  @UseGuards(AuthenticationGuard)
  @Render('admin/pages/guidance')
  @BackLink('/admin/dashboard')
  adminGuidance(): void {
    // do nothing.
  }

  @Get('/admin/decisions/guidance')
  @UseGuards(AuthenticationGuard)
  @Render('admin/decisions/guidance')
  @BackLink('/admin/decisions')
  adminDecisionGuidance(): void {
    // do nothing
  }

  @Get('/cookies')
  @Render('pages/cookies')
  cookies() {
    // do nothing.
  }

  @Get('/privacy-notice')
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

  @Get('/regulation-types')
  @Render('pages/regulation-types')
  @BackLink(
    (request: Request) => request.session.searchResultUrl,
    'app.backToSearch',
  )
  regulationTypes() {
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
