import {
  Controller,
  Param,
  ParseIntPipe,
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { DecisionDatasetsService } from '../decision-datasets.service';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class PublicationController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
  ) {}

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
