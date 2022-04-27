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
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { flashMessage } from '../../common/flash-message';
import { Permissions } from '../../common/permissions.decorator';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionsService } from '../../professions/professions.service';
import { UserPermission } from '../../users/user-permission';
import { DecisionDatasetsService } from '../decision-datasets.service';
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
  @BackLink('/admin/decisions/:professionId/:organisationId/:year')
  async new(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
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
    @Req() request: Request,
  ) {
    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

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
