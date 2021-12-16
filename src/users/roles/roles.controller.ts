import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Render,
  Res,
  UseGuards,
  UseFilters,
  Req,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { UsersService } from '../users.service';
import { UserRole } from '../user.entity';
import { RolesDto } from './dto/roles.dto';
import { ValidationExceptionFilter } from '../../validation/validation-exception.filter';
import { backLink } from '../../common/utils';
import { EditTemplate } from './interfaces/edit-template';
@UseGuards(AuthenticationGuard)
@Controller('/admin/users')
export class RolesController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/roles/edit')
  @UseGuards(AuthenticationGuard)
  @Render('users/roles/edit')
  async edit(@Req() req: Request, @Param('id') id): Promise<EditTemplate> {
    const user = await this.usersService.find(id);
    const roles = Object.values(UserRole);

    return {
      ...user,
      roles,
      backLink: backLink(req),
    };
  }

  @Post(':id/roles')
  @UseFilters(
    new ValidationExceptionFilter('users/roles/edit', 'blogPost', {
      roles: Object.values(UserRole),
    }),
  )
  async create(
    @Body() rolesDto: RolesDto,
    @Param('id') id,
    @Res() res,
  ): Promise<void> {
    console.log(rolesDto);
    const user = await this.usersService.find(id);
    const updated = Object.assign(user, rolesDto);

    await this.usersService.save(updated);

    res.redirect(`/admin/users/${id}/confirm`);
  }
}
