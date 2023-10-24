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
import { DatasetDetailsTemplate } from './interfaces/dataset-details-template.interface';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class PublicationController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
    private readonly i18nService: I18nService,
  ) {}

  @Get('/:professionId/:organisationId/:year/publish')
  @Permissions(UserPermission.PublishDecisionData)
  @Render('admin/decisions/publication/new')
  @BackLink((request) =>
    request.query.fromEdit === 'true'
      ? '/admin/decisions/:professionId/:organisationId/:year/edit'
      : '/admin/decisions/:professionId/:organisationId/:year',
  )
  async new(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
  ): Promise<DatasetDetailsTemplate> {
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

  @Put('/:professionId/:organisationId/:year/publish')
  @Permissions(UserPermission.PublishDecisionData)
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

    await this.decisionDatasetsService.publish(dataset);

    const messageTitle = this.i18nService.translate<string>(
      'decisions.admin.publication.confirmation.heading',
    ) as string;

    const messageBody = this.i18nService.translate<string>(
      'decisions.admin.publication.confirmation.body',
    ) as string;

    request.flash('success', flashMessage(messageTitle, messageBody));

    response.redirect(
      `/admin/decisions/${professionId}/${organisationId}/${year}`,
    );
  }
}
