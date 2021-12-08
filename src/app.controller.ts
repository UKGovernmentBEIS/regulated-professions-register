import { Controller, Get, Render, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './common/authentication.guard';
import { Roles } from './common/roles.decorator';
import { Request } from 'express';
import { UserRole } from './users/user.entity';
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

  @Get('/admin/superadmin')
  @UseGuards(AuthenticationGuard)
  @Roles(UserRole.Admin)
  @Render('admin/superadmin')
  superAdmin(@Req() req: Request): object {
    return {
      name: req.oidc.user.nickname,
    };
  }
}
