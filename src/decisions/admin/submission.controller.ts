import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Render,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { RequestWithAppSession } from '../../common/interfaces/request-with-app-session.interface';
import { Permissions } from '../../common/permissions.decorator';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionsService } from '../../professions/professions.service';
import { UserPermission } from '../../users/user-permission';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { checkCanChangeDataset } from './helpers/check-can-change-dataset.helper';
import { PublicationTemplate } from './interfaces/publication-template.interface';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class SubmissionController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/:organisationId/:year/submit')
  @Permissions(UserPermission.SubmitDecisionData)
  @Render('admin/decisions/submission/new')
  @BackLink((request) =>
    request.query.fromEdit === 'true'
      ? '/admin/decisions/:professionId/:organisationId/:year/edit'
      : '/admin/decisions/:professionId/:organisationId/:year',
  )
  async new(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
    @Req() request: RequestWithAppSession,
  ): Promise<PublicationTemplate> {
    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const organisation = await this.organisationsService.find(organisationId);

    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    if (!dataset) {
      throw new Error('Dataset not found');
    }

    checkCanChangeDataset(request, profession, organisation, year, !!dataset);

    return {
      profession: profession,
      organisation: organisation,
      year: year,
    };
  }

  @Put('/:professionId/:organisationId/:year/submit')
  @Permissions(UserPermission.SubmitDecisionData)
  async create(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
    @Res() response: Response,
    @Req() request: RequestWithAppSession,
  ) {
    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    const profession = await this.professionsService.findWithVersions(
      professionId,
    );

    const organisation = await this.organisationsService.find(organisationId);

    checkCanChangeDataset(request, profession, organisation, year, !!dataset);

    await this.decisionDatasetsService.submit(dataset);

    const messageTitle = await this.i18nService.translate(
      'decisions.admin.submission.confirmation.heading',
    );

    const messageBody = await this.i18nService.translate(
      'decisions.admin.submission.confirmation.body',
    );

    request.flash('success', flashMessage(messageTitle, messageBody));

    response.redirect(
      `/admin/decisions/${professionId}/${organisationId}/${year}`,
    );
  }
}
