import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Put,
  Render,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { Permissions } from '../../common/permissions.decorator';
import { OrganisationsService } from '../../organisations/organisations.service';
import { ProfessionsService } from '../../professions/professions.service';
import { UserPermission } from '../../users/user-permission';
import { DecisionDatasetsService } from '../decision-datasets.service';
import { PublicationTemplate } from './interfaces/publication-template.interface';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class PublicationController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly professionsService: ProfessionsService,
    private readonly organisationsService: OrganisationsService,
  ) {}

  @Get('/:professionId/:organisationId/:year/publish')
  @Permissions(UserPermission.PublishDecisionData)
  @Render('admin/decisions/publication/new')
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

  @Put('/:professionId/:organisationId/:year/publish')
  @Permissions(UserPermission.PublishDecisionData)
  async create(
    @Param('professionId') professionId: string,
    @Param('organisationId') organisationId: string,
    @Param('year', ParseIntPipe) year: number,
    @Res() response: Response,
  ) {
    const dataset = await this.decisionDatasetsService.find(
      professionId,
      organisationId,
      year,
    );

    await this.decisionDatasetsService.publish(dataset);

    response.redirect(
      `/admin/decisions/${professionId}/${organisationId}/${year}`,
    );
  }
}
