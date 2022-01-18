import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { ProfessionsService } from '../professions.service';
import { ConfirmationTemplate } from './interfaces/confirmation.template';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user.entity';
@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class ConfirmationController {
  constructor(private professionsService: ProfessionsService) {}

  @Post('/:id/confirmation')
  @Permissions(UserPermission.CreateProfession)
  async create(@Res() res: Response, @Param('id') id: string): Promise<void> {
    const profession = await this.professionsService.find(id);

    if (profession.confirmed) {
      return res.redirect(`/admin/professions/${id}/confirmation?amended=true`);
    }

    await this.professionsService.confirm(profession);

    res.redirect(`/admin/professions/${id}/confirmation`);
  }

  @Get('/:id/confirmation')
  @Permissions(UserPermission.CreateProfession)
  @Render('admin/professions/confirmation')
  async new(
    @Param('id') id: string,
    @Query('amended') amended: boolean,
  ): Promise<ConfirmationTemplate> {
    const profession = await this.professionsService.find(id);

    return { name: profession.name, amended: Boolean(amended) };
  }
}
