import { Controller, Get, Render, UseGuards, Req } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './common/authentication.guard';
import { Request } from 'express';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('show')
  getHello(): object {
    return {};
  }

  @Get('/admin')
  @UseGuards(AuthenticationGuard)
  @Render('admin/dashboard')
  admin(@Req() req: Request): object {
    return {
      name: req.oidc.user.nickname,
    };
  }
}
