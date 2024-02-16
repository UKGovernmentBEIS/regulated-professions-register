import { Controller, Get, Post, Req, Res, Body, Query } from '@nestjs/common';
import { NewDto } from './dto/new.dto';
import { Response } from 'express';
import { RequestWithAppSession } from '../common/interfaces/request-with-app-session.interface';
import { Validator } from '../helpers/validator';
import { ValidationFailedError } from '../common/validation/validation-failed.error';
import { Feedback } from './feedback.entity';
import { FeedbackService } from './feedback.service';
import { BackLink } from '../common/decorators/back-link.decorator';
import { getPathFromReferrer } from '../helpers/get-path.helper';

@Controller()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Get('/feedback/')
  @BackLink((request: RequestWithAppSession) => {
    const referrer = request.get('referrer');
    return getPathFromReferrer(referrer);
  })
  async new(
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
    @Query('satisfaction') satisfaction: string,
  ): Promise<void> {
    const returnUrl = getPathFromReferrer(request.get('referrer'));
    let submittedValues;

    if (satisfaction) {
      submittedValues = {
        feedbackOrTechnical: "No, I'd like to leave feedback about the service",
        satisfaction: satisfaction,
      };
    }

    return this.renderNew(request, response, null, submittedValues, returnUrl);
  }

  @Post('/feedback/')
  @BackLink((request: RequestWithAppSession) => {
    const returnUrl = request.body.returnUrl;
    if (returnUrl) {
      return returnUrl;
    } else {
      return '/';
    }
  })
  async update(
    @Req() request: RequestWithAppSession,
    @Res() response: Response,
    @Body() body,
  ): Promise<void> {
    const validator = await Validator.validate(NewDto, body);
    const submittedValues = validator.obj;

    let errors = {};

    if (!validator.valid()) {
      errors = {
        ...errors,
        ...new ValidationFailedError(validator.errors).fullMessages(),
      };
    }

    if (Object.keys(errors).length) {
      return this.renderNew(
        request,
        response,
        errors,
        submittedValues,
        body.returnUrl,
      );
    } else {
      if (submittedValues.feedbackOrTechnical.startsWith('No')) {
        submittedValues.problemArea = '';
        submittedValues.problemAreaPage = '';
        submittedValues.problemDescription = '';
      } else {
        submittedValues.betaSurveyEmail = '';
        submittedValues.betaSurveyYesNo = '';
        submittedValues.contactAuthority = '';
        submittedValues.contactAuthorityNoReason = '';
        submittedValues.improvements = '';
        submittedValues.satisfaction = '';
        submittedValues.visitReason = '';
        submittedValues.visitReasonOther = '';
      }

      const newFeedback: Feedback = {
        id: undefined,
        ...submittedValues,
        created_at: undefined,
      };

      this.feedbackService.save(newFeedback);
      return this.renderSent(response);
    }
  }

  private async renderSent(response: Response): Promise<void> {
    response.render('feedback/sent');
  }

  private async renderNew(
    request: RequestWithAppSession,
    response: Response,
    errors: object | undefined = undefined,
    submittedValues: object | undefined = undefined,
    returnUrl: string | undefined = '/',
  ): Promise<void> {
    response.render('feedback/new', {
      request,
      errors,
      submittedValues,
      returnUrl,
    });
  }
}
