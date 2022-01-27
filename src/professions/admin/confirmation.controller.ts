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
import { UserPermission } from '../../users/user-permission';

@UseGuards(AuthenticationGuard)
@Controller('admin/professions')
export class ConfirmationController {
  constructor(private professionsService: ProfessionsService) {}

  @Post('/:professionId/versions/:versionId/confirmation')
  @Permissions(UserPermission.CreateProfession)
  async create(
    @Res() res: Response,
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<void> {
    const profession = await this.professionsService.find(professionId);

    if (profession.confirmed) {
      return res.redirect(
        `/admin/professions/${professionId}/versions/${versionId}/confirmation?amended=true`,
      );
    }

    await this.professionsService.confirm(profession);

    res.redirect(
      `/admin/professions/${professionId}/versions/${versionId}/confirmation`,
    );
  }

  @Get('/:professionId/versions/:versionId/confirmation')
  @Permissions(UserPermission.CreateProfession)
  @Render('admin/professions/confirmation')
  async new(
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
    @Query('amended') amended: boolean,
  ): Promise<ConfirmationTemplate> {
    const profession = await this.professionsService.find(professionId);

    return { name: profession.name, amended: Boolean(amended) };
  }
}
