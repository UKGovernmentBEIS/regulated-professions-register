import { Controller, Get, Render, Res, UseGuards } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { AuthenticationGuard } from '../../common/authentication.guard';
import { BackLink } from '../../common/decorators/back-link.decorator';
import { UserPermission } from '../../users/user-permission';
import { Permissions } from '../../common/permissions.decorator';
import { FeedbackCsvWriter } from './helpers/feedback-csv-writer.helper';
import { FeedbackService } from '../feedback.service';
import { getExportTimestamp } from './helpers/get-export-timestamp.helper';
import { Response } from 'express';

@UseGuards(AuthenticationGuard)
@Controller('admin/feedback')
export class FeedbackController {
  constructor(
    private readonly feedbackService: FeedbackService,
    private readonly i18nService: I18nService,
  ) {}

  @Get()
  @Permissions(UserPermission.ManageFeedback)
  @Render('admin/feedback/index')
  @BackLink('/admin/dashboard')
  index() {
    // do nothing
  }

  @Get('export')
  @Permissions(UserPermission.ManageFeedback)
  async export(@Res() response: Response): Promise<void> {
    const allFeedback = await this.feedbackService.all();

    const writer = new FeedbackCsvWriter(
      response,
      `feedback-${getExportTimestamp()}`,
      allFeedback,
      this.i18nService,
    );

    writer.write();
  }
}
