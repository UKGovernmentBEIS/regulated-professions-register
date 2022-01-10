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
import { Request, Response } from 'express';
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
        'regulatory-authorities': '/regulatory-authorities/search',
        'annual-figures': '/annual-figures',
      }[service];

      if (path === undefined) {
        throw new NotFoundException();
      }

      res.redirect(path);
    }
  }
}
