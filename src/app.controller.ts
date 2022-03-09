import { Controller, Get, Render, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from './common/authentication.guard';
@Controller()
export class AppController {
  @Get()
  @Render('index')
  index() {
    // do nothing.
  }

  @Get('/admin')
  @UseGuards(AuthenticationGuard)
  @Render('admin/dashboard')
  admin() {
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
