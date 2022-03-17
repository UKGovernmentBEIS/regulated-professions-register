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
import { Permissions } from '../../common/permissions.decorator';
import { ProfessionVersionsService } from '../profession-versions.service';
import { Profession } from '../profession.entity';
import { ProfessionPresenter } from '../presenters/profession.presenter';
import { getActingUser } from '../../users/helpers/get-acting-user.helper';
import { getOrganisationsFromProfession } from '../helpers/get-organisations-from-profession.helper';
import { ShowTemplate } from './interfaces/show-template.interface';
import { isUK } from '../../helpers/nations.helper';
import { checkCanViewProfession } from '../../users/helpers/check-can-view-profession';

@UseGuards(AuthenticationGuard)
@Controller('/admin/professions')
export class ProfessionVersionsController {
  constructor(
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
    @Req() req: RequestWithAppSession,
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

    checkCanViewProfession(req, profession);

    const presenter = new ProfessionPresenter(profession, this.i18nService);

    const hasLiveVersion = await this.professionVersionsService.hasLiveVersion(
      profession,
    );

    const organisations = getOrganisationsFromProfession(profession).map(
      (organisation) => Organisation.withLatestVersion(organisation),
    );

    const nations = await Promise.all(
      (profession.occupationLocations || []).map(async (code) =>
        Nation.find(code).translatedName(this.i18nService),
      ),
    );

    const industries = await Promise.all(
      profession.industries.map(
        async (industry) => await this.i18nService.translate(industry.name),
      ),
    );

    const qualification = new QualificationPresenter(
      profession.qualification,
      this.i18nService,
    );

    return {
      profession,
      presenter,
      hasLiveVersion,
      qualificationSummaryList: await qualification.summaryList(
        true,
        profession.occupationLocations
          ? !isUK(profession.occupationLocations)
          : true,
      ),
      nations,
      industries,
      organisations,
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

    checkCanViewProfession(req, latestVersion.profession);

    const version = await this.professionVersionsService.create(
      latestVersion,
      getActingUser(req),
    );

    return res.redirect(
      `/admin/professions/${version.profession.id}/versions/${version.id}/check-your-answers?edit=true`,
    );
  }
}
