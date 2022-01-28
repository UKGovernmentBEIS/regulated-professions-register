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
import { AuthenticationGuard } from '../common/authentication.guard';
import { BackLink } from '../common/decorators/back-link.decorator';
import { Legislation } from '../legislations/legislation.entity';
import { Qualification } from '../qualifications/qualification.entity';
import { ProfessionVersion } from './profession-version.entity';
import { ProfessionVersionsService } from './profession-versions.service';
import { ProfessionsService } from './professions.service';

@UseGuards(AuthenticationGuard)
@Controller('/admin/professions')
export class ProfessionVersionsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
  ) {}

  @Get('/:professionId/versions/edit')
  @Render('admin/professions/edit')
  @BackLink('/admin/professions')
  async edit(@Param('professionId') professionId: string) {
    const profession = await this.professionsService.find(professionId);

    return { profession };
  }

  @Post('/:professionId/versions')
  async create(
    @Res() res: Response,
    @Param('professionId') professionId: string,
  ): Promise<void> {
    const latestVersion =
      await this.professionVersionsService.findLatestForProfessionId(
        professionId,
      );

    const newQualification = {
      ...latestVersion.qualification,
      id: undefined,
      created_at: undefined,
      updated_at: undefined,
    } as Qualification;

    const newLegislations = latestVersion.legislations.map((legislation) => {
      return {
        ...legislation,
        id: undefined,
        created_at: undefined,
        updated_at: undefined,
      } as Legislation;
    });

    const newVersion = {
      ...latestVersion,
      id: undefined,
      status: undefined,
      created_at: undefined,
      updated_at: undefined,
      qualification: newQualification,
      legislations: newLegislations,
    } as ProfessionVersion;

    const version = await this.professionVersionsService.save(newVersion);

    return res.redirect(
      `/admin/professions/${version.profession.id}/versions/${version.id}/check-your-answers?edit=true`,
    );
  }
}
