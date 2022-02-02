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
  Query,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthenticationGuard } from '../../common/authentication.guard';
import { UsersService } from '../users.service';
import { UserPermission } from '../user-permission';
import { PermissionsDto } from './dto/permissions.dto';
import { Permissions } from '../../common/permissions.decorator';
import { ValidationExceptionFilter } from '../../common/validation/validation-exception.filter';
import { EditTemplate } from './interfaces/edit-template';
import { BackLink } from '../../common/decorators/back-link.decorator';

@UseGuards(AuthenticationGuard)
@Controller('/admin/users')
export class PermissionsController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id/permissions/edit')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @Render('admin/users/permissions/edit')
  @BackLink((request: Request) =>
    request.query.change === 'true'
      ? '/admin/users/:id/check-your-answers'
      : '/admin/users/:id/personal-details/edit',
  )
  async edit(
    @Req() req: Request,
    @Param('id') id,
    @Query('change') change: boolean,
  ): Promise<EditTemplate> {
    const user = await this.usersService.find(id);
    const permissions = Object.values(UserPermission);

    return {
      ...user,
      permissions,
      change: change,
    };
  }

  @Post(':id/permissions')
  @Permissions(UserPermission.CreateUser, UserPermission.EditUser)
  @UseFilters(
    new ValidationExceptionFilter('admin/users/permissions/edit', 'user', {
      permissions: Object.values(UserPermission),
    }),
  )
  async create(
    @Body() permissionsDto: PermissionsDto,
    @Param('id') id,
    @Res() res,
  ): Promise<void> {
    const user = await this.usersService.find(id);
    const updated = Object.assign(user, permissionsDto);

    await this.usersService.save(updated);

    res.redirect(`/admin/users/${id}/confirm`);
  }
}
