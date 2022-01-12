import {
  Controller,
  Get,
  Render,
  Req,
  UseGuards,
  Res,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { AppService } from './app.service';
import { AuthenticationGuard } from './common/authentication.guard';
import { Permissions } from './common/permissions.decorator';
import { Request, Response } from 'express';
import { UserPermission } from './users/user.entity';
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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

  @Get('/select-service')
  selectService(@Res() res: Response, @Query('service') service?: string) {
    if (service === undefined) {
      res.render('select-service');
    } else {
      const path = {
        professions: '/professions/search',
        'regulatory-authorities': '/regulatory-authorities',
        'annual-figures': '/annual-figures',
      }[service];

      if (path === undefined) {
        throw new NotFoundException();
      }

      res.redirect(path);
    }
  }

  @Get('/admin/superadmin')
  @Permissions(UserPermission.CreateUser)
  @UseGuards(AuthenticationGuard)
  @Render('admin/superadmin')
  superAdmin(@Req() req: Request): object {
    return {
      name: req.oidc.user.nickname,
    };
  }
}
