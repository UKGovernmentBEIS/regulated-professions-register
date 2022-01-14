import {
  Controller,
  Get,
  Param,
  Post,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationGuard } from '../../../common/authentication.guard';
import { Permissions } from '../../../common/permissions.decorator';
import { UserPermission } from '../../../users/user.entity';
import { LegislationTemplate } from './interfaces/legislation.template';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class LegislationController {
  @Get('/:id/legislation/edit')
  @Render('admin/professions/add-profession/legislation')
  @Permissions(UserPermission.CreateProfession)
  async edit(@Param('id') id: string): Promise<LegislationTemplate> {
    return {
      backLink: `/admin/professions/${id}/qualification-information/edit`,
    };
  }

  @Post('/:id/legislation')
  @Permissions(UserPermission.CreateProfession)
  async update(@Res() res: Response, @Param('id') id: string): Promise<void> {
    res.redirect(`/admin/professions/${id}/check-your-answers`);
  }
}
