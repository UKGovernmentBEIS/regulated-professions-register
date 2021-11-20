import { Controller, Get, Render, UseGuards } from '@nestjs/common';

import { AppService } from './app.service';

import { AuthenticationGuard } from './authentication/authentication.guard';
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
  @Render('admin')
  admin(): object {
    return {};
  }
}
