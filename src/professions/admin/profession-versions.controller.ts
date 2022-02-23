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
import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Nation } from '../../nations/nation';
import { Organisation } from '../../organisations/organisation.entity';
import QualificationPresenter from '../../qualifications/presenters/qualification.presenter';
import { UserPermission } from '../../users/user-permission';
import { ShowTemplate } from '../interfaces/show-template.interface';
import { Permissions } from '../../common/permissions.decorator';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { ProfessionsService } from '../professions.service';
import { ProfessionPresenter } from '../presenters/profession.presenter';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';

@UseGuards(AuthenticationGuard)
@Controller('/admin/professions')
export class ProfessionVersionsController {
  constructor(
    private readonly professionsService: ProfessionsService,
    private readonly professionVersionsService: ProfessionVersionsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get(':professionId/versions/:versionId')
  @Permissions(
    UserPermission.EditProfession,
    UserPermission.DeleteProfession,
    UserPermission.PublishProfession,
  )
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
    const presenter = new ProfessionPresenter(profession, this.i18nService);

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
      ? new QualificationPresenter(profession.qualification, this.i18nService)
      : null;

    return {
      profession,
      presenter,
      qualificationSummaryList: qualification
        ? await qualification.summaryList()
        : null,
      nations,
      industries,
      organisation,
    };
  }

  @Post('/:professionId/versions')
  @Permissions(UserPermission.EditProfession)
  async create(
    @Res() res: Response,
    @Req() req: RequestWithAppSession,
    @Param('professionId') professionId: string,
  ): Promise<void> {
    const latestVersion =
      await this.professionVersionsService.findLatestForProfessionId(
        professionId,
      );

    const version = await this.professionVersionsService.create(
      latestVersion,
      getActingUser(req),
    );

    return res.redirect(
      `/admin/professions/${version.profession.id}/versions/${version.id}/check-your-answers?edit=true`,
    );
  }
}
