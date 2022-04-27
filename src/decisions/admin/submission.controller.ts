import {
  Controller,
  Param,
  ParseIntPipe,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { flashMessage } from '../../common/flash-message';
import { Permissions } from '../../common/permissions.decorator';
import { UserPermission } from '../../users/user-permission';
import { DecisionDatasetsService } from '../decision-datasets.service';

@UseGuards(AuthenticationGuard)
@Controller('admin/decisions')
export class SubmissionController {
  constructor(
    private readonly decisionDatasetsService: DecisionDatasetsService,
    private readonly i18nService: I18nService,
  ) {}

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
