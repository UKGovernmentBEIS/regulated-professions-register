import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { AuthenticationGuard } from './common/authentication.guard';
import { Request } from 'express';
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
  admin(@Req() req: Request): object {
    return {
      name: req.oidc.user.nickname,
    };
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
