import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../common/authentication.guard';
import { BackLink } from '../common/decorators/back-link.decorator';
import { RequestWithAppSession } from '../common/interfaces/request-with-app-session.interface';
import { Legislation } from '../legislations/legislation.entity';
import { Nation } from '../nations/nation';
import { Organisation } from '../organisations/organisation.entity';
import QualificationPresenter from '../qualifications/presenters/qualification.presenter';
import { Qualification } from '../qualifications/qualification.entity';
import { ShowTemplate } from './interfaces/show-template.interface';
import { ProfessionVersion } from './profession-version.entity';
import { ProfessionVersionsService } from './profession-versions.service';
import { Profession } from './profession.entity';
import { ProfessionsService } from './professions.service';

@UseGuards(AuthenticationGuard)
@Controller('/admin/professions')
export class ProfessionVersionsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/versions/edit')
  @Render('admin/professions/edit')
  @BackLink('/admin/professions')
  async edit(@Param('professionId') professionId: string) {
    const profession = await this.professionsService.find(professionId);

    return { profession };
  }

  @Get(':professionId/versions/:versionId')
  @Render('admin/professions/show')
  @BackLink('/admin/professions')
  async show(
    @Param('professionId') professionId: string,
    @Param('versionId') versionId: string,
  ): Promise<ShowTemplate> {
    const version = await this.professionVersionsService.findByIdWithProfession(
      professionId,
      versionId,
    );

    if (!version) {
      throw new NotFoundException(
        `A profession with ID ${professionId}, version ${versionId} could not be found`,
      );
    }

    const profession = Profession.withVersion(version.profession, version);

    const organisation = Organisation.withLatestLiveVersion(
      profession.organisation,
    );

    const nations = await Promise.all(
      profession.occupationLocations.map(async (code) =>
        Nation.find(code).translatedName(this.i18nService),
      ),
    );

    const industries = await Promise.all(
      profession.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    const qualification = profession.qualification
      ? new QualificationPresenter(profession.qualification)
      : null;

    return {
      profession,
      qualification: qualification,
      nations,
      industries,
      organisation,
    };
  }

  @Post('/:professionId/versions')
  async create(
    @Res() res: Response,
    @Req() req: RequestWithAppSession,
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
      user: req.appSession.user,
      qualification: newQualification,
      legislations: newLegislations,
    } as ProfessionVersion;

    const version = await this.professionVersionsService.save(newVersion);

    return res.redirect(
      `/admin/professions/${version.profession.id}/versions/${version.id}/check-your-answers?edit=true`,
    );
  }
}
